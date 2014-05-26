
import csv
import sys
import json
import os
company = {}

total_index = int(sys.argv[4])
response_index = int(sys.argv[5])
cname = sys.argv[6]

result = {}

if os.path.exists(sys.argv[1]):
    result = json.loads(open(sys.argv[1]).read())

with open(sys.argv[2]) as isoname:
    reader = csv.reader(isoname)

    for row in reader:
        print row
        cc = row[0]
        total = row[total_index]
        responses = row[response_index]
        if not cc in result:
            result[cc] = []
        if cc in result:
            result[cc].append({cname:{'total': total, 'responses':
                responses}})

open(sys.argv[3],'w').write(json.dumps(result, indent=4))
