import netCDF4 as nc
import csv

#script to integrate and calculate weather data

#load weather forecasts
fn = 'adaptor.mars.internal-1611138531.3177989-30471-27-588f1373-dee1-4701-821a-4ba786b0a88d.nc'
ds = nc.Dataset(fn)


time = ds['t'][:]

temperatur2019 = []
temperatur2020 = []

for i, entry in enumerate(time):

    if i <365:
        wert = entry[0][0][0]
        if wert > 0:
            temperatur2019.append(wert-273.15)
        wert = entry[1][0][0]
        if wert > 0:
            temperatur2019.append(wert-273.15)

    else:
        wert = entry[0][0][0]
        if wert > 0:
            temperatur2020.append(wert-273.15)
        wert = entry[1][0][0]
        if wert > 0:
            temperatur2020.append(wert-273.15)




wetterdaten2019 = []
wetterdaten2020 = []

wetter2019 = []
wetter2020 = []

#load actual weather data

with open('produkt_tu_stunde_19970701_20191231_03379.csv') as data:
    reader = csv.reader(data, delimiter=';')
    for row in reader:
        wetter2019.append(row)

with open('produkt_tu_stunde_20190720_20210119_03379.csv') as data:
    reader = csv.reader(data, delimiter=';')
    for row in reader:
        wetter2020.append(row)


for row in wetter2019:
    date = row[1]
    if date[-2:] == '12':
        wetterdaten2019.append([date, row[3]])

for row in wetter2020:
    date = row[1]
    if date[-2:] == '12':
        wetterdaten2020.append([date, row[3]])


#combining forecasts and actual weather

#2019
final2019 =[]
positive2019 = []
#load other data to access date format
with open('Positive2019final.csv') as data:
    reader = csv.reader(data, delimiter=',')
    for row in reader:
        positive2019.append(row)

unterschied2019 = []
maxdelta = 0


for i, row in enumerate(wetterdaten2019):
    delta = abs(float(row[1]) - temperatur2019[i])
    delta = round(delta,1)

    if delta > maxdelta:
        maxdelta = delta
    unterschied2019.append(delta)


for i, row in enumerate(unterschied2019):
    newrow = ['Abweichung Wettervorhersage',row , row/maxdelta,positive2019[i][3]]
    final2019.append(newrow)



#2020
final2020 =[]
positive2020 = []
#load other data to access date format
with open('Positive2020final.csv') as data:
    reader = csv.reader(data, delimiter=',')
    for row in reader:
        positive2020.append(row)

unterschied2020 = []
maxdelta = 0


for i, row in enumerate(wetterdaten2020):
    delta= abs(float(row[1]) - temperatur2020[i])
    delta = round(delta,1)

    if delta > maxdelta:
        maxdelta = delta
    unterschied2020.append(delta)


for i, row in enumerate(unterschied2020):
    newrow = ['Abweichung Wettervorhersage',row , row/maxdelta,positive2020[i][3]]
    final2020.append(newrow)

#write out
with open('WetterAbweichung2019final.csv', mode='w', newline='') as test:
    writer = csv.writer(test, delimiter=',')
    for row in final2019:
        writer.writerow(row)

with open('WetterAbweichung2020final.csv', mode='w', newline='') as test:
    writer = csv.writer(test, delimiter=',')
    for row in final2020:
        writer.writerow(row)

