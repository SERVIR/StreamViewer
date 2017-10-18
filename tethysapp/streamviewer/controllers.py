from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from tethys_sdk.gizmos import *
from utilities import *
import json

def home(request):
    """
    Controller for the app home page.
    """

    # Generate the random streamflows
    streamflows = generate_streamflow()

    context = {
        'streamflows':json.dumps(streamflows) #Passing the streamflows to the front end here

    }

    return render(request, 'streamviewer/home.html', context)