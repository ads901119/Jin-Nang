from google.appengine.dist import use_library
use_library('django', '1.2')

from django.utils import simplejson as json
import datetime
from google.appengine.api import users
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db

class Messagelog(db.Model):
    
    sender = db.StringProperty()   # sender = shawnwun@gmail.com
    title = db.StringProperty()     # title = Good day
    message= db.TextProperty()      # message = today is really my day
    location = db.GeoPtProperty()    # location = 23.3,123.22
    type = db.StringProperty()      # type = private
    receiver = db.StringProperty()    # receiver = lai61616@gmail.com
    
    #Time filter
    beginTime = db.DateTimeProperty()    # 2011-05-19-14-46-12
    endTime = db.DateTimeProperty()    # 2011-05-20-17-00-00
    
    #Post time
    posttime = db.DateTimeProperty(auto_now_add=True)
    
class MainPage(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
            output = template.render('html/main.html', {'username': user.nickname(),
                                                        'logIOurl': users.create_logout_url('/')})
        else:
            output = template.render('html/main.html', {'username': 'guest',
                                                        'logIOurl' :  users.create_login_url('/')})
        self.response.out.write(output)

class Post(webapp.RequestHandler):
    def post(self):
        myname = self.request.get('sender')
        mytitle = self.request.get('title').encode('unicode-escape')
        mymessage = self.request.get('message').encode('unicode-escape')
        
        locateX = str(self.request.get('location')).split(',')[0]
        locateY = str(self.request.get('location')).split(',')[1]
        mylocation = db.GeoPt(float(locateX),float(locateY))
        
        mytype = self.request.get('type')
        myreceiver = self.request.get('receiver')
        
        begin = datetime.datetime.strptime(str(self.request.get('begintime')),'%Y-%m-%d-%H-%M-%S')
        end = datetime.datetime.strptime(str(self.request.get('endtime')),'%Y-%m-%d-%H-%M-%S')
        
        messagelog = Messagelog(sender=str(myname),title=str(mytitle),message=str(mymessage),\
                                location=mylocation,type=str(mytype),receiver=str(myreceiver),\
                                beginTime=begin,endTime=end)
        messagelog.put()
        self.response.out.write("TRUE")
        

class Ask(webapp.RequestHandler):
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
     
                
class Check(webapp.RequestHandler):
    def post(self):
        sender = str(self.request.get('sender'))
        key = str(self.request.get('key'))
        
        if(key):
            #ret = db.GqlQuery("SELECT * FROM Messagelog WHERE key=:1",key)
            e = db.get(key)
            jlist = {}
            jlist['Title'] = str(e.title)
            jlist['Draft'] = str(e.message)
            jlist['Receiver'] = str(e.receiver)
            jlist['Location'] = str(e.location)
            jlist['Datetime'] = str(e.posttime)
            self.response.out.write(json.dumps(jlist))

        else:
            ret = db.GqlQuery("SELECT * FROM Messagelog WHERE sender =:1 "
                              "ORDER BY posttime DESC", sender)
            allist = []
            for e in ret:
                jlist = {}
                jlist['Key'] = str(e.key())
                jlist['Title'] = str(e.title)
                jlist['Draft'] = str(e.message)
                jlist['Receiver'] = str(e.receiver)
                jlist['Location'] = str(e.location)
                jlist['Datetime'] = str(e.posttime)
                allist.append(jlist)
                
            self.response.out.write(json.dumps(allist))

class Remove(webapp.RequestHandler):
    def post(self):
        key = str(self.request.get('key'))
        e = db.get(key)
        e.delete()
        self.response.out.write('TRUE')

class Retrieve(webapp.RequestHandler):
    def post(self):
        begin_filt = datetime.datetime.strptime(str(self.request.get('begintime')),'%Y-%m-%d-%H-%M-%S')
        end_filt = datetime.datetime.strptime(str(self.request.get('endtime')),'%Y-%m-%d-%H-%M-%S')
        locateX, locateY = str(self.request.get('location')).split(',')
        radius = float(self.request.get('radius'))
        
        ret = db.Query(Messagelog).filter('type = ','public')
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
                                      ('/check', Check),
                                      ('/remove', Remove),
                                      ('/retrieve', Retrieve)],
                                     debug=True)

def main():
    run_wsgi_app(application)
    
if __name__ == "__main__":
    main()