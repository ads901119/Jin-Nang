from google.appengine.dist import use_library
use_library('django', '1.2')

from django.utils import simplejson as json
import datetime
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
import logging
import geobox
import models
import facebook

FACEBOOK_APP_ID = "116735828415506"
FACEBOOK_APP_SECRET = "a06843f40ad5c9349667c8250a032d70"

class PublicMessage(db.Model):
    sender = db.StringProperty()         # sender = user id
    title = db.StringProperty()          # title = Good day
    message= db.TextProperty()           # message = today is really my day
    location = db.GeoPtProperty()        # location = 23.3,123.22
    type = db.IntegerProperty()          # 0: public, 1: friend, 2: mine 
    
    beginTime = db.DateTimeProperty()    # 2011-05-19-14-46-12
    endTime = db.DateTimeProperty()      # 2011-05-20-17-00-00
    
    posttime = db.DateTimeProperty(auto_now_add=True)

class Messagelog(PublicMessage):
    receiver = db.StringProperty()    # receiver = lai61616@gmail.com (email)

class User(db.Model):
    id = db.StringProperty(required=True)
    created = db.DateTimeProperty(auto_now_add=True)
    updated = db.DateTimeProperty(auto_now=True)
    name = db.StringProperty(required=True)
    profile_url = db.StringProperty(required=True)
    access_token = db.StringProperty(required=True)

class BaseHandler(webapp.RequestHandler):
    """Provides access to the active Facebook user in self.current_user

    The property is lazy-loaded on first access, using the cookie saved
    by the Facebook JavaScript SDK to determine the user ID of the active
    user. See http://developers.facebook.com/docs/authentication/ for
    more information.
    """
    @property
    def current_user(self):
        if not hasattr(self, "_current_user"):
            self._current_user = None
            cookie = facebook.get_user_from_cookie(
                self.request.cookies, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)
            if cookie:
                # Store a local instance of the user data so we don't need
                # a round-trip to Facebook on every request
                user = User.get_by_key_name(cookie["uid"])
                if not user:
                    graph = facebook.GraphAPI(cookie["access_token"])
                    profile = graph.get_object("me")
                    user = User(key_name=str(profile["id"]),
                                id=str(profile["id"]),
                                name=profile["name"],
                                profile_url=profile["link"],
                                access_token=cookie["access_token"])
                    user.put()
                elif user.access_token != cookie["access_token"]:
                    user.access_token = cookie["access_token"]
                    user.put()
                self._current_user = user
        return self._current_user

class MainPage(BaseHandler):
    def get(self):
        user = users.get_current_user()
        if user: # openid logged-in
            output = template.render('html/main.html', {'username': user.nickname(),
                                                        'useremail': user.email(),
                                                        'userkey': user.user_id(),
                                                        'logIOurl': users.create_logout_url('/')})
        elif self.current_user != None: # facebook logged-in
            fb_user = self.current_user
            graph = facebook.GraphAPI(fb_user.access_token)
            user_email = graph.get_object("me", fields="email")["email"]
            user_id = "fb" + fb_user.id
            
            output = template.render('html/main.html', {'username': fb_user.name,
                                                        'useremail': user_email,
                                                        'userkey': user_id,
                                                        'logIOurl': 'javascript:fbLogout();'})
            
        else: # not logged-in
            """
            loginUrls = []
            for p in openIdProviders:
                p_name = p.split('.')[0] # take "AOL" from "AOL.com"
                p_url = p.lower()        # "AOL.com" -> "aol.com"
                loginUrls += ['<a href="%s">%s</a>' % (
                    users.create_login_url(federated_identity=p_url), p_name)]
            
            loginHtml = "Login with:<br/>" + ", ".join(loginUrls)
            """
            #loginHtml = '<iframe src="html/login.html" style="border:none; overflow:hidden; width:300px; height:310px;"></iframe>'
            output = template.render('html/main.html', {'username': 'guest',
                                                        'useremail': '',
                                                        'userkey': '-1'})
                                                        #'logIOurl': loginHtml})
        self.response.out.write(output)

class LoginHandler(BaseHandler):
    def get(self):
        self.response.out.write(template.render('html/login.html', {'continue_url': self.request.host_url}))
        

class Post(BaseHandler):
    def post(self):
        myname = self.request.get('sender')
        mytitle = self.request.get('title').encode('unicode-escape')
        mymessage = self.request.get('message').encode('unicode-escape')
        
        locateX = str(self.request.get('location')).split(',')[0]
        locateY = str(self.request.get('location')).split(',')[1]
        mylocation = db.GeoPt(float(locateX),float(locateY))
        
        mytype = int(self.request.get('type')) # 0: public, 1: friend, 2: mine 
         
        #begin = datetime.datetime.strptime(str(self.request.get('start')),'%Y-%m-%d-%H-%M-%S')
        #end = datetime.datetime.strptime(str(self.request.get('end')),'%Y-%m-%d-%H-%M-%S')
        
        begin = datetime.datetime.strptime(str(self.request.get('start')),'%Y-%m-%d')
        end = datetime.datetime.strptime(str(self.request.get('end')),'%Y-%m-%d')
            
        if mytype == 0:
            msg = PublicMessage(sender=str(myname),
                                title=str(mytitle),
                                message=str(mymessage),
                                location=mylocation,
                                type=0,
                                beginTime=begin,
                                endTime=end)
            msg.put()
        else: # public for now
            myreceiver = self.request.get('receiver')
            
            msg = Messagelog(sender=str(myname),
                             title=str(mytitle),
                             message=str(mymessage),
                             location=mylocation,
                             type=mytype,
                             receiver=str(myreceiver),
                             beginTime=begin,
                             endTime=end)
            msg.put()
            
        self.response.out.write("TRUE")
        

class Ask(BaseHandler):
    def post(self):
        receiver = str(self.request.get('receiver'))
        
        locateX = str(self.request.get('location')).split(',')[0]
        locateY = str(self.request.get('location')).split(',')[1]
        
        time = datetime.datetime.strptime(str(self.request.get('time')),'%Y-%m-%d-%H-%M-%S')
        
        ret = db.GqlQuery("SELECT * FROM Messagelog WHERE receiver =:1",receiver)
        
        allist = []
        for e in ret:
            begin = e.beginTime
            end = e.endTime
            regisX,regisY = str(e.location).split(',')
            distance = ( (float(regisX)-float(locateX))**2 + (float(regisY)-float(locateY))**2 )**0.5
            
            if( time>=begin and end>=time and distance<=0.001 ):
                jlist = []
                jlist.append({'Key':str(e.key())})
                jlist.append({'Sender':str(e.sender)})
                jlist.append({'Receiver':str(e.receiver)})
                jlist.append({'Datetime':str(e.posttime)})
                jlist.append({'Location':str(e.location)})
                jlist.append({'Title':str(e.title)})
                jlist.append({'Message':str(e.message)})
                allist.append(jlist)
                
        self.response.out.write(json.dumps(allist))
        
class Public(BaseHandler):
    def get(self):
        user = users.get_current_user()
        allist = []
        
        ret = db.GqlQuery("SELECT * FROM PublicMessage ORDER BY posttime DESC")
        
        for e in ret:
            jlist = {}
            title = str(e.title).decode('unicode-escape')
            dur = e.beginTime.strftime('%m/%d')
            
            jlist['start'] = str(e.beginTime) 
            if (e.beginTime != e.endTime):
                dur += " - " + e.endTime.strftime('%m/%d')
                jlist['end'] = str(e.endTime)
                
            jlist['title'] = title + " (" + dur + ")"
                
            loc = {}
            loc['lat'] = str(e.location.lat)
            loc['lon'] = str(e.location.lon)
            jlist['point'] = loc               
            
            if user:
                canDelete = (e.sender == user.user_id())
            elif self.current_user != None:
                canDelete = (e.sender == ''.join(['fb', self.current_user.id]))
            else:
                canDelete = False
                
            output = template.render('html/infoTemplate.html', {'title': title,
                                                                'content': str(e.message).decode('unicode-escape'),
                                                                'startD': str(e.beginTime.date()),
                                                                'endD': str(e.endTime.date()),
                                                                'delete': canDelete
                                                                })
            options = {}
            options['infoHtml'] = output
            jlist['options'] = options
                
            allist.append(jlist)
                
        self.response.out.write(json.dumps(allist))
                
class Check(BaseHandler):
    def get(self):
        #user_email = ""
        user_id = "-1"
        user = users.get_current_user() # openid user
        if user != None:
            #user_email = user.email()
            user_id = user.user_id()
        elif self.current_user != None: # facebook user
            #graph = facebook.GraphAPI(self.current_user.access_token)
            #user_email = graph.get_object("me", fields="email")["email"]
            user_id = ''.join(['fb', self.current_user.id])

        allist = []
        ret = db.GqlQuery("SELECT * FROM Messagelog WHERE sender =:1 "
                          "ORDER BY posttime DESC", user_id)
        logging.error("type user_id: " + str(type(user_id)))
        for e in ret:
            jlist = {}
            title = str(e.title).decode('unicode-escape')
            dur = e.beginTime.strftime('%m/%d')
            
            jlist['start'] = str(e.beginTime) 
            if (e.beginTime != e.endTime):
                dur += " - " + e.endTime.strftime('%m/%d')
                jlist['end'] = str(e.endTime)
                
            jlist['title'] = title + " (" + dur + ")"
            jlist['Receiver'] = str(e.receiver)
                
            loc = {}
            loc['lat'] = str(e.location.lat)
            loc['lon'] = str(e.location.lon)
            jlist['point'] = loc               
            
            canDelete = (e.sender == user_id) 
                
            output = template.render('html/infoTemplate.html', {'title': title,
                                                                'content': str(e.message).decode('unicode-escape'),
                                                                'startD': str(e.beginTime.date()),
                                                                'endD': str(e.endTime.date()),
                                                                'delete': canDelete
                                                                })
            options = {}
            options['infoHtml'] = output
            jlist['options'] = options
                
            allist.append(jlist)
                
        self.response.out.write(json.dumps(allist))

class Remove(BaseHandler):
    def post(self):
        key = str(self.request.get('key'))
        e = db.get(key)
        e.delete()
        self.response.out.write('TRUE')

class Retrieve(BaseHandler):
    def post(self):
        begin_filt = datetime.datetime.strptime(str(self.request.get('begintime')),'%Y-%m-%d-%H-%M-%S')
        end_filt = datetime.datetime.strptime(str(self.request.get('endtime')),'%Y-%m-%d-%H-%M-%S')
        locateX, locateY = str(self.request.get('location')).split(',')
        radius = float(self.request.get('radius'))
        
        ret = db.Query(Messagelog).filter('type = ', '0')
        #ret = db.GqlQuery("SELECT * FROM Messagelog WHERE type =:1 "
        #                  "ORDER BY datetime DESC", 'public')
        
        allist = []
        for e in ret:
            begintime = e.beginTime
            endtime = e.endTime
            regisX,regisY = str(e.location).split(',')
            distance = ( (float(regisX)-float(locateX))**2 + (float(regisY)-float(locateY))**2 )**0.5
            if( distance<radius and (not begintime>=end_filt or not endtime<=begin_filt) ):
                jlist = []
                jlist.append({'Key':str(e.key())})
                jlist.append({'Sender':str(e.sender)})
                jlist.append({'Receiver':str(e.receiver)})
                jlist.append({'Datetime':str(e.posttime)})
                jlist.append({'Location':str(e.location)})
                jlist.append({'Title':str(e.title)})
                jlist.append({'Message':str(e.message)})
                allist.append(jlist)
                
        self.response.out.write(json.dumps(allist))

    
application = webapp.WSGIApplication(
                                     [('/', MainPage),
                                      ('/post', Post),
                                      ('/ask', Ask),
                                      ('/public', Public),
                                      ('/check', Check),
                                      ('/remove', Remove),
                                      ('/retrieve', Retrieve),
                                      ('/login', LoginHandler)],
                                     debug=True)

def main():
    run_wsgi_app(application)
    
if __name__ == "__main__":
    main()