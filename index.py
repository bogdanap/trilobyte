
import json
import pygeoip
import web
from operator import itemgetter

g4 = pygeoip.GeoIP('GeoIP.dat', pygeoip.MEMORY_CACHE)
STATISTICS = 'statistics.json'
DEFAULT = 'default_usage.json'
COMPANY_RATES_PER_COUNTRY = "static/resources/json/company_rates_per_country.json"
CPI = "static/resources/json/cpi.json"
GCB = "static/resources/json/gcb.json"
COMPANY_TOTALS = "static/resources/json/company_totals.json"
WORLD_COUNTRIES = "static/resources/json/world-countries.json"


default_usage = json.loads(open(DEFAULT).read())


def user_stats():
    result = {}
    try:
        stats = open(STATISTICS).read()
        all_stats = json.loads(stats)
    except Exception:
        all_stats = {}
    client_ip = web.ctx.ip
    client_country = g4.country_code_by_addr(client_ip)
    if not client_country:
        client_country = 'BE'
    if client_ip in all_stats:
        result = all_stats[client_ip]
    else:
        result = default_usage
    result['country'] = client_country
    return result


class Statistics:
    def GET(self):
        return json.dumps(user_stats(), indent=4)


class CountryData():
    def GET(self):
        client_ip = web.ctx.ip
        client_country = g4.country_code_by_addr(client_ip)
        companies = json.loads(open(COMPANY_RATES_PER_COUNTRY).read())
        companies = companies['BE']
        if client_country in companies:
            companies = companies[client_country]
        rez = ['Company,Accepted,Declined']
        for k, v in companies.iteritems():
            total = int(v['total'])
            if total:
                name = k.capitalize()
                accepted = int(v['responses'])
                declined = total - int(v['responses'])
                rez.append('%s,%s,%s' % (name, accepted, declined))
        return '\n'.join(rez)


class CountrySummary():
    def GET(self):
        client_ip = web.ctx.ip
        client_country = g4.country_code_by_addr(client_ip)
        if not client_country:
            client_country = 'BE'
        cpi_data = json.loads(open(CPI).read())
        cpi = 50
        if client_country in cpi_data:
            cpi = cpi_data[client_country]
        gcb_data = json.loads(open(GCB).read())
        gcb = 4
        if client_country in gcb_data:
            gcb = gcb_data[client_country]

        return json.dumps(dict(cpi=cpi, gcb=gcb))


class CompanyTotals():

    def GET(self):
        stats = user_stats()
        companies = stats['monitored']
        monitored = set()
        for c in companies:
            splt = c.split('.')
            monitored.add(splt[0])
        print monitored
        totals = json.loads(open(COMPANY_TOTALS).read())
        rez = [(float("inf"), 'Company, Requests, User accounts requested, Accepted Requests')]
        for k, v in totals.iteritems():
            if k.lower() in monitored:
                rez.append((v.get('requests', 0), "%s,%s,%s,%s" % (v.get('company'), v.get('requests'), v.get('users'),
                           v.get('response'))))
        rez = sorted(rez, key=itemgetter(0), reverse=True)
        rez = map(lambda x: x[1], rez)
        return '\n'.join(rez)


class WorldCountries():
    def GET(self):
        stats = user_stats()
        countries = stats['destinations']
        wc = json.loads(open(WORLD_COUNTRIES).read())
        for feat in wc['features']:
            try:
                feat['properties']['active'] = feat['properties'].get('code',
                     'LALA') in countries
            except KeyError:
                return feat
        return json.dumps(wc)


class Redirect():
    def GET(self):
        return web.redirect("static/src")

urls = (
    '/statistics', 'Statistics',
    '/country_data.csv', 'CountryData',
    '/company_totals.csv', 'CompanyTotals',
    '/country_summary.json', 'CountrySummary',
    '/world_countries_cpi.json', 'WorldCountries',
    '/', 'Redirect'
)

app = web.application(urls, globals())

if __name__ == "__main__":
    print g4
    app.run()
