import csv
import re

#Prepares the Corona Data for the Visualisation


corona = []


#adjusts the date format to fit the other data
def createDate(date):
    date = re.split('-', date)
    newdate = "" + date[1] + "/" + date[2] + "/" + date[0][-2:]
    return newdate

with open('coronaData.csv') as data:
    reader = csv.reader(data, delimiter =',')
    for row in reader:
        if len(row) > 3:
            corona.append(row)

    newCorona =[]
    max=0

    #only use values fpr germany
    for row in corona:
        if row[3] == "Germany":
            if int(row[9]) > max:
                max = int(row[9])
            newCorona.append(row)

    finalData = []
    #creats dummy data for testing
    #dummyJanuary
    for i in range(31):
        if i < 9 :
            newRow = ['Positive', 0, 0 , '01/0' + str(i+1) +'/20']
        else: newRow = ['Positive', 0, 0 , '01/' + str(i+1) +'/20']
        finalData.append(newRow)

    # dummyFebruary
    for i in range(28):
        if i < 9:
            newRow = ['Positive', 0, 0, '02/0' + str(i + 1) + '/20']
        else:
            newRow = ['Positive', 0, 0, '02/' + str(i + 1) + '/20']
        finalData.append(newRow)

    for row in newCorona:
        #remove 2021
        if row[0][2:4] == "20":
            date = createDate(row[0])
            #relevant data + date
            newRow = ['Positive', int(row[9]), int(row[9])/max, date]
            finalData.append(newRow)

    i=0
    for row in finalData:
        if int(finalData[i+1][3][3:5]) - int(row[3][3:5])!= 1 and int(row[3][3:5]) < 29 :
            print(row)
        i+=1
        if i== len(finalData)-1:
            i=0

    #only used for testing
    # finalTest = []
    # finalTest2 = []
    # for row in finalData:
    #     newRow = ['Wetter', 1337, 0.8, row[3]]
    #     finalTest.append(newRow)
    #     newRow2 = ['Flugzzeuge', 42, 0.6, row[3]]
    #     finalTest2.append(newRow2)

with open('test.csv', mode='w', newline='') as test:
    writer = csv.writer(test, delimiter=',')
    for row in finalData:
        writer.writerow(row)
    # for row in finalTest:
    #     writer.writerow(row)
    # for row in finalTest2:
    #     writer.writerow(row)





