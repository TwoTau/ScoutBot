import {Injectable} from '@angular/core';
import {Storage, SqlStorage} from 'ionic-angular';

@Injectable()
export class TeamStorageService {
    static get parameters() {
        return;
    }

    constructor() {
        this.storage = new Storage(SqlStorage);
        this.storage.query("CREATE TABLE IF NOT EXISTS eventteams (number INTEGER PRIMARY KEY, nickname TEXT, website TEXT)").then(data => {
            console.log("created from service");
        }, error => {
            console.log("create error -> " + JSON.stringify(error.err));
        });

        this.allTeams = [];
        this.loadFromDb();
    }

    escape(teamName) {
        var entityMap = {
            "&": "&amp;",
            '"': '&quot;',
            "'": '&#39;'
        };

        return teamName.replace(/[&"']/g, function(c) {
            return entityMap[c];
        });
    }

    unescape(escapedName) {
        return escapedName.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39/g, "'");
    }

    loadFromDb() {
        this.storage.query("SELECT * FROM eventteams").then(data => {
            if(data.res.rows.length > 0) {
                for(let i = 0; i < data.res.rows.length; i++) {
                    this.allTeams.push({
                        number: data.res.rows.item(i).number,
                        name: this.unescape(data.res.rows.item(i).nickname),
                        website: decodeURIComponent(data.res.rows.item(i).website)
                    });
                }
                // document.getElementById("addChangeEvent").innerHTML = "Change event";,
            }
        }, error => {
            console.log("select error -> " + JSON.stringify(error.err));
        });
    }

    addTeamToDb(number, name, website) {
        this.storage.query("INSERT INTO eventteams (number, nickname, website) VALUES ('" + number + "', '" + this.escape(name) + "', '" + encodeURIComponent(website) + "')").then(data => {

        }, error => {
            console.log("insert error -> " + JSON.stringify(error.err) + " with " + name + ", " + website + ", " + website);
        });
    }

    clearDb() {
        this.storage.query("DELETE FROM eventteams").then(data => {
            this.allTeams = [];
            // document.getElementById("addChangeEvent").innerHTML = "Add event";
        }, error => {
            console.log("delete error -> " + JSON.stringify(error.err));
        });
    }

    getTeams() {
        return this.allTeams;
    }
}
