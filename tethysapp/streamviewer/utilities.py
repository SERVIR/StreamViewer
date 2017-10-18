import json
import datetime
import random

def generate_streamflow():

    # Generating streamflows for 20 days
    timestep = range(0,20)

    mega_list = [] # Where the timestep,stream id and its respective streamflow are being stored for each day

    for day in timestep: # Day is the timestep
        day_list = [] # Store metadata for the timestep

        #  There are 86 stream ids for this particular layer. Generating random streamflows for all 86 stream ids
        for i in range(1,87):
                # Format [current day,streamid, streamflow].
                day_list.append([day,i,random.randint(1,300000) / random.randint(1,100)]) #Adding the streamflows to the day list

        mega_list.append(day_list) # Adding the day list to the mega list

    return mega_list