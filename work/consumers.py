from channels.generic.websocket import WebsocketConsumer
import json, os, shutil
from .topng import generate_converted_pngs
from mysite1.settings import STATIC_DIR

class ChannelConsumer(WebsocketConsumer):
    def connect(self):
        self.accept()

        imagedir = os.path.join(STATIC_DIR,"images")
        savedir = os.path.join(STATIC_DIR, "saves")
        outputdir = os.path.join(STATIC_DIR, "output")

        if not os.path.exists(imagedir):
            self.disconnect(None)
            return
        
        if not os.path.exists(savedir):
            self.disconnect(None)
            return
        
        if os.path.exists(outputdir):
            shutil.rmtree(outputdir)
        os.makedirs(outputdir)

        generate_converted_pngs(imagedir, savedir, outputdir, self.progress_notification)

        



        


    def progress_notification(self,progress_value):
        self.send(text_data= json.dumps({
            'progress': progress_value
        }))



    def disconnect(self, close_code):
        pass

    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        self.send(text_data=json.dumps({
            'message': message
        }))