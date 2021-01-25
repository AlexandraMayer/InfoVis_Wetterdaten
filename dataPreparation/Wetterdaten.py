import csv

#script used to analyse weather data for the first time
wetterdaten2019 = []
wetterdaten2020 = []

wetter2019 = []
wetter2020 = []

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
print(wetterdaten2020)