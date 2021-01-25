import csv
import random


#Prepares all non corona data for visualisation

basePositive2020 = []
basePositive2019 = []
baseFlugDaten = []
baseFlugDaten2020 = []
baseFlugDaten2019 = []

positive2019 = []
flugDaten2020 = []
flugDaten2019 = []
wetter2020 = []
wetter2019 = []
final2019 = []
final2020 = []

#loading existing data

with open('Positive2020final.csv') as data:
    reader = csv.reader(data, delimiter=',')
    for row in reader:
        basePositive2020.append(row)

with open('FlugDaten2020final.csv') as data:
    reader = csv.reader(data, delimiter=',')
    for row in reader:
        baseFlugDaten2020.append(row)

with open('FlugDaten2019final.csv') as data:
    reader = csv.reader(data, delimiter=',')
    for row in reader:
        baseFlugDaten2019.append(row)

with open('Positive2019final.csv') as data:
    reader = csv.reader(data, delimiter=',')
    for row in reader:
        basePositive2019.append(row)

with open('FlugDatenOriginal.csv') as data:
    reader = csv.reader(data, delimiter=';')
    for row in reader:
        baseFlugDaten.append(row)

with open('TestDaten2020.csv') as data:
    reader = csv.reader(data, delimiter=',')
    for row in reader:
        final2020.append(row)

with open('TestDaten2019.csv') as data:
    reader = csv.reader(data, delimiter=',')
    for row in reader:
        final2019.append(row)

#flightData2020
    #creates dayly aproximation out of weakly data
splitData2020 = []
maxValue = 0
for row in baseFlugDaten:
    if row[0]=="1":
        for i in range(9):
            splitData2020.append(int(round(int(row[1])/7)))
            if int(round(int(row[1])/7)) > maxValue:
                maxValue = int(round(int(row[1])/7))
    else:
        for i in range(7):
            splitData2020.append(int(round(int(row[1]) / 7)))
            if int(round(int(row[1])/7)) > maxValue:
                maxValue = int(round(int(row[1])/7))

    #arrange data
    i=0
for row in basePositive2020:
    newRow = ['Fluege' , str(splitData2020[i]) , str(splitData2020[i]/maxValue) , row[3]]
    flugDaten2020.append(newRow)
    i+=1

#flightData2019
    #creates dayly aproximation out of weakly data
splitData2019 = []
maxValue = 0
for row in baseFlugDaten:
    if row[0]=="1":
        for i in range(8):
            splitData2019.append(int(round(int(row[2])/7)))
            if int(round(int(row[2])/7)) > maxValue:
                maxValue = int(round(int(row[2])/7))
    else:
        for i in range(7):
            splitData2019.append(int(round(int(row[2]) / 7)))
            if int(round(int(row[2])/7)) > maxValue:
                maxValue = int(round(int(row[2])/7))

    #arrange data
    i=0
for row in basePositive2019:
    newRow = ['Fluege' , str(splitData2019[i]) , str(splitData2019[i]/maxValue) , row[3]]
    flugDaten2019.append(newRow)
    i+=1

#creates all 0 values for the corona positives in 2019
for row in basePositive2020:
    newRow = [row[0],0,0,row[3][:-2] + '19']
    positive2019.append(newRow)

#build dummy weather data 2020 for experimenting/testing
wetterWerte2020 = []
maxValue = 0
r=random.random()
for i in range(366):
    # if i % 5 == 0:
    #     r = random.random()
    r=random.random()
    flug = float(baseFlugDaten2020[i][2])
    absoluteValue = round(((r + 4*(1-flug)) / 5 * 3)+0.5,1)
    if absoluteValue > maxValue:
        maxValue = absoluteValue
    wetterWerte2020.append(absoluteValue)

i=0
for row in basePositive2020:
    newRow = ['Wetter' , wetterWerte2020[i] , wetterWerte2020[i]/maxValue , row[3]]
    wetter2020.append(newRow)
    i+=1

#creates comletely random data for experimenting/testing
zufall = []
wert = 1* random.random()
for i, row in enumerate(basePositive2020):
    if i % 5 == 0:
        wert = 1* random.random()
    newRow = ['Wetter' , wert , wert/1 , row[3]]
    zufall.append(newRow)


#build dummy weather data 2019 for experimenting/testing
wetterWerte2019 = []
maxValue = 0
r=random.random()
for i in range(365):
    if i % 5 == 0:
        r = random.random()
    flug = float(baseFlugDaten2019[i][2])
    absoluteValue = round(((r + 4*(1-flug)) / 5 * 3)+0.5,1)
    if absoluteValue > maxValue:
        maxValue = absoluteValue
    wetterWerte2019.append(absoluteValue)

i=0
for row in basePositive2019:
    newRow = ['Wetter' , wetterWerte2019[i] , wetterWerte2019[i]/maxValue , row[3]]
    wetter2019.append(newRow)
    i+=1


with open('test.csv', mode='w', newline='') as test:
    writer = csv.writer(test, delimiter=',')
    for row in zufall:
        writer.writerow(row)
