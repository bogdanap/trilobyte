
import csv
import sys

name_to_iso = {}

with open(sys.argv[1]) as isoname:
    reader = csv.reader(isoname)
    for row in reader:
        name = row[0]
        code = row[1]
        name_to_iso[name] = code

name_index = int(sys.argv[4])
out = csv.writer(open(sys.argv[3], 'w'))
with open(sys.argv[2]) as cpi:
    cpi_reader = csv.reader(cpi)
    for cpi in cpi_reader:
        print cpi
        name = cpi[name_index]
        code = name_to_iso.get(name, 'XXX')
        out.writerow([code] + cpi)
