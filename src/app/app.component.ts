import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as AWS from 'aws-sdk';

declare var TextDecoder;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'hackathon-leaderboard';
  data = [];

  constructor(
    private http: HttpClient
  ) { }

  async ngOnInit() {
    this.readFile((data) => {
      this.data = data;
    });
  }

  readFile(onFinish) {
    AWS.config.credentials = new AWS.Credentials({
      accessKeyId: '', secretAccessKey: ''
    });

    AWS.config.update({ region: 'us-east-2' })
    let s3 = new AWS.S3();
    var params = {
      Bucket: "traffic-simulator-scores",
      Key: "scores_latest.csv"
    };

    let data = [];
    s3.getObject(params, function (err, d) {
      if (err)
        console.log(err, err.stack); // an error occurred
      else {
        const string = new TextDecoder('utf-8').decode(d.Body);
        console.log(string)
        let allTextLines = string.split(/\r|\n|\r/);
        allTextLines.shift()
        for (var i = 0; i < allTextLines.length; i++) {
          if (allTextLines[i] != "") {
            let line = allTextLines[i].split(',');
            let record = {
              "timestamp": line[1],
              "team": line[2],
              "best_time_1_1": line[3],
              "best_time_1_2": line[5],
              "best_time_2_2": line[7],
              "last_time": line[9],
              "last_co2": line[10],
              "weighted_co2": line[11],
              "weighted_time": line[12]
            }
            data.push(record);
          }
        }
        data = data.sort((a, b) => a.weighted_time - b.weighted_time)
        data.forEach((val, ind) => {
          val['index'] = ind + 1;
        })
        onFinish(data);
      }
    });
  }
}
