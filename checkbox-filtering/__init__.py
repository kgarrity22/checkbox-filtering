
from pytrials.client import ClinicalTrials
from flask import Flask, render_template, jsonify, request
import csv
import json 


app = Flask(__name__)
@app.route('/interactive/')
def interactive():
	return render_template('interactive.html')


@app.route('/pies/')
def visuals():
    return render_template('pies_and_checks.html')



# @app.route('/background_process')
# def background_process():
# 	try:
# 		lang = request.args.get('disease_name', 0, type=str)
# 		if lang.lower() == 'python':
# 			return jsonify(result='You are wise')
# 		else:
# 			return jsonify(result='Try again.')
# 	except Exception as e:
# 		return str(e)


@app.route('/get_trials')
def get_trials():
    print("entered!!")
    ct = ClinicalTrials()
    print("right before searched")
    searched = request.args.get('disease_name', None, None)
    print("befor get full studies")
    # Get 100 full studies related to Coronavirus and COVID in json format.
    ct.get_full_studies(search_expr=searched, max_studies=100)


    csv_data = ct.get_study_fields(
        search_expr=searched,
        fields=["LeadSponsorName", "LeadSponsorClass", "InterventionName", "InterventionType", "OverallStatus", "NCTId", "StartDate", "BriefTitle",  "Phase", "PrimaryOutcomeDescription"],
        max_studies=100,
        fmt="csv",
    )
    # print("search_expr: ", search_expr)

    print("searched: ", searched)

    #print(type(csv))

    output_str = ""
    data = []

    
    for i in range(1, 101):
        dt = {}
        for j in range(len(csv_data[0])):
            dt[csv_data[0][j]] = csv_data[i][j]
        data.append(dt)


    for i in range(len(csv_data[0])):
        output_str += csv_data[0][i]
        output_str += " : "
        output_str += csv_data[1][i]

    with open('disease.csv', 'w', newline='') as csvfile:
        disease_writer = csv.writer(csvfile, delimiter=' ')
        disease_writer
        for i in range(100):
            disease_writer.writerow(csv_data[i])
    
    print("Wrote CSV")
    print(len(data))
    print("data: ", data[0])
    # data.append({"columns": ["NCTId", "BriefTitle", "InterventionType", "InterventionName", "BriefSummary", "LeadSponsorName",
    #                          "Phase", "LeadSponsorClass", "StartDate", "OverallStatus", "PrimaryOutcomeDescription"]})
        
        
    # print(data)
    print(jsonify(data))
    return jsonify(data)

    # for i in range(len(csv[0])):
    #     print(csv[0][i], ":", csv[2][i])

    # for i in range(len(csv[0])):
    #     print(csv[0][i], ":", csv[3][i])
