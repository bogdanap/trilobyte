
import csv
import sys
import json

name_to_iso = {}

result = {}
with open(sys.argv[1]) as isoname:
    reader = csv.reader(isoname)
    for row in reader:
        result[row[0]]=row[3]
print json.dumps(result, indent=4)
