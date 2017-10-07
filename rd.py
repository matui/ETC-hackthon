import codecs
import csv
l1 = []
l3 = []
l5 = []
with open('data/ETCMap.csv', 'rb') as f:
    count = 0
    for rw in f:
        l = rw.split(',')
        if count<=160:
            l1.append(l[5])
        elif count<=316:
            l3.append(l[5])
        else:
            l5.append(l[5])
        count += 1

with open('out.txt','w') as w:
    w.write('[')
    for idx, i in enumerate(l1):
        w.write('"' + i + '"')
        if idx==len(l1):
            w.write(']')
            break
        w.write(',')
        

