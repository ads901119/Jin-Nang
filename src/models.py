import logging
import math
from google.appengine.ext import db

import geobox

# List of resolutions and slices. Should be in increasing order of size/scope.
GEOBOX_CONFIGS = (
    (4, 5, True),
    (3, 2, True),
    (3, 8, False),
    (3, 16, False),
    (2, 5, False),
    (2, 2, False)
)

# Radius of the earth in miles.
RADIUS = 6371.009


def _earth_distance(lat1, lon1, lat2, lon2):
    lat1, lon1 = math.radians(float(lat1)), math.radians(float(lon1))
    lat2, lon2 = math.radians(float(lat2)), math.radians(float(lon2))
    return RADIUS * math.acos(math.sin(lat1) * math.sin(lat2) + 
        math.cos(lat1) * math.cos(lat2) * math.cos(lon2 - lon1))

class Event(db.Model):
    title = db.StringProperty(required=True)
    description = db.TextProperty()
    type = db.StringProperty()
    creator = db.StringProperty()
    
    startTime = db.DateTimeProperty()
    endTime = db.DateTimeProperty()  # ISO-8601 %Y-%m-%dT%H:%M:%S
    
    location = db.StringProperty()
    geolocation = db.GeoPtProperty()
    geoboxes = db.StringListProperty()
    no_geolocation = db.BooleanProperty()
    
    @classmethod
    def query(cls, lat, lon, max_results, min_params, other_filters={}):
        """Queries for Muni stops repeatedly until max results or scope is reached.
        Args:
          lat, lon: Coordinates of the agent querying.
          max_results: Maximum number of events to find.
          min_params: Tuple (resolution, slice) of the minimum resolution to allow.
        
        Returns:
          List of (distance, Events) tuples, ordered by minimum distance first.
          There will be no duplicates in these results. Distance is in meters.
        """
        # Maps title to Event instances.
        found_events = {}
        
        # Do concentric queries until the max number of results is reached.
        for params in GEOBOX_CONFIGS:
            if len(found_events) >= max_results:
                break
            if params < min_params:
                break
    
            resolution, slice, unused = params
            box = geobox.compute(lat, lon, resolution, slice)
            logging.debug("Searching for box=%s at resolution=%s, slice=%s",
                          box, resolution, slice)
            query = cls.all()
            query.filter("geoboxes =", box)
            for k, v in other_filters.items():
                query.filter(k, v)
            results = query.fetch(50)
            logging.debug("Found %d results", len(results))
          
            # De-dupe results.
            for result in results:
                if result.title not in found_events:
                    found_events[result.title] = result
    
        # Now compute distances and sort by distance.
        events_by_distance = []
        for event in found_events.itervalues():
            distance = _earth_distance(lat, lon, event.geolocation.lat, event.geolocation.lon)
            events_by_distance.append((distance, event))
        events_by_distance.sort()
    
        return events_by_distance[:max_results]
