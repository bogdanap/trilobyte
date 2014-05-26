"use strict";

function gauge_value(usage_data, callback){
	$.ajax({
		url: "/static/resources/json/cpi.json",
		context: document.body
	}).done(function(cpi) {
		var country_cpi = 100 - cpi[usage_data.country];
		$.ajax({
			url: "/static/resources/json/company_totals.json",
			context: document.body
		}).done(function(company_totals){
			for (var k in usage_data.monitored)
				if (usage_data.monitored.hasOwnProperty(k)){
					var splt = k.split("."),
					s = 0, c = 0, totals;

					if (company_totals[splt[0]]){
						totals = company_totals[splt[0]];
						s += 100 * (totals.response / totals.requests);
						c += 1;
					}
				}
				s /= c;
				var company_response_rate = s;
				$.ajax({
					url: "/static/resources/json/company_rates_per_country.json",
					context: document.body
				}).done(function(company_totals){
					var country_data, total=0, responses=0;
					if (company_totals[usage_data.country]){
						country_data = company_totals[usage_data.country];
						for(var i in country_data){
							total += parseInt(country_data[i].total, 10);
							responses += parseInt(country_data[i].responses, 10);
						}
					}
					var country_response_rate = 0;
					if (total){
						country_response_rate = responses/total * 100;
					}
					var s=0, c=0;
					if (country_response_rate){
						s += country_response_rate;
						c += 1;
					}
					if (company_response_rate){
						s += company_response_rate;
						c += 1;
					}
					if(country_cpi){
						s += country_cpi;
						c += 1;
					}
					if (c){
						s /= c;
					}
					console.log(country_cpi, country_response_rate, company_response_rate);
					console.log(s);
					callback(s);
				});
		})
	});

};

function get_gauge_score(callback){
	$.ajax({
		url: "/statistics",
		context: document.body
	}).done(function(usage){
		gauge_value(JSON.parse(usage), callback);
	});
}


