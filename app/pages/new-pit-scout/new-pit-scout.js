import {Page, NavController, Alert, Toast, Storage, SqlStorage} from 'ionic-angular';
import {Camera} from 'ionic-native';

@Page({
    templateUrl: 'build/pages/new-pit-scout/new-pit-scout.html',
})

export class NewPitScoutPage {
    static get parameters() {
        return [[NavController]];
    }

    constructor(nav) {
        this.nav = nav;
        this.storage = new Storage(SqlStorage);

        this.allTeams = [];

        this.storage.get("eventCode").then(value => {
            if(value !== "false" && value !== undefined) {
                this.loadTeamsFromDb();
            }
        });

        this.storage.get("darkscheme").then(value => {
            this.darkscheme = value;
        });

        this.teamNumber;
        this.teamName = "???";

        this.canHighShoot = false;
        this.canLowShoot = false;
        this.canPickupBalls = false;
        this.canSweepBalls = false;

        this.drivetrain_traction = false;
        this.drivetrain_mecanum = false;
        this.drivetrain_omni = false;
        this.drivetrain_2speed = false;
        this.drivetrain_otherSelected = false;
        this.drivetrain_other = "";
        this.speed;

        this.startLocationMatters = false;
        this.autoMove = false;
        this.autoShootHigh = false;
        this.autoShootLow = false;
        this.autoGear = false;
        this.autoGearAny = false;

        this.canPlaceGear = false;
        this.avgGears;
        this.canPickupGear = false;

        this.climbing = "No";

        this.roles = {
            highShooting: false,
            lowShooting: false,
            gears: false,
            defense: false
        };

        this.comments = "";

    }

    loadTeamsFromDb() {
        this.storage.query("CREATE TABLE IF NOT EXISTS eventteams (number INTEGER PRIMARY KEY, nickname TEXT, website TEXT)").then(data => {}, error => {
            console.log("create error -> " + JSON.stringify(error.err));
        });

        this.storage.query("SELECT * FROM eventteams").then(data => {
            if(data.res.rows.length > 0) {
                for(let i = 0; i < data.res.rows.length; i++) {
                    this.allTeams.push({
                        number: data.res.rows.item(i).number,
                        name: unescape(data.res.rows.item(i).nickname)
                    });
                }
            }
        }, error => {
            console.log("select error -> " + JSON.stringify(error.err));
        });

        // this SHOULD be in a separate function
        this.storage.query("CREATE TABLE IF NOT EXISTS pitdata (id INTEGER PRIMARY KEY AUTOINCREMENT, csvrow TEXT)").then(data => {},
        error => {
            console.log("create error -> " + JSON.stringify(error));
        });
    }

    changeTeamName() {
        // allTeams stores team numbers as integers but this.teamNumber is a string
        let team = this.allTeams.find(team => team.number === +this.teamNumber);
        this.teamName = team !== undefined ? team.name : "???";
    }

    takePicture() {
        Camera.getPicture({
            sourceType: 1,
            destinationType: 1,
            correctOrientation: true,
            saveToPhotoAlbum: true,
            encodingType: 0
        });
    }

    boolToCapitalBool(bool) {
        return bool ? "TRUE" : "FALSE";
    }

    saveData() {
        let teamNumber = this.teamNumber;
        let canHighShoot = this.boolToCapitalBool(this.canHighShoot);
        let canLowShoot = this.boolToCapitalBool(this.canLowShoot);
        let canPickupBalls = this.boolToCapitalBool(this.canPickupBalls);
        let canSweepBalls = this.boolToCapitalBool(this.canSweepBalls);
        let wheelType_traction = this.boolToCapitalBool(this.drivetrain_traction);
        let wheelType_mecanum = this.boolToCapitalBool(this.drivetrain_mecanum);
        let wheelType_omni = this.boolToCapitalBool(this.drivetrain_omni);
        let wheelType_2speed = this.boolToCapitalBool(this.drivetrain_2speed);
        let wheelType_other = "";
        if(this.drivetrain_otherSelected) {
            wheelType_other = this.drivetrain_other;
        }
        let startLocationMatters = this.boolToCapitalBool(this.startLocationMatters);
        let autoMove = this.boolToCapitalBool(this.autoMove);
        let autoShootHigh = this.boolToCapitalBool(this.autoShootHigh);
        let autoShootLow = this.boolToCapitalBool(this.autoShootLow);
        let autoGear = this.boolToCapitalBool(this.autoGear);
        let autoGearAny = this.boolToCapitalBool(this.autoGearAny);
        let canPlaceGear = this.boolToCapitalBool(this.canPlaceGear);
        let avgGears = this.avgGears;
        if(!avgGears) {
            avgGears = 0;
        }
        let canPickupGear = this.boolToCapitalBool(this.canPickupGear);
        let climbing = this.climbing;
        let roleHighShooting = this.boolToCapitalBool(this.roles.highShooting);
        let roleLowShooting = this.boolToCapitalBool(this.roles.lowShooting);
        let roleGears = this.boolToCapitalBool(this.roles.gears);
        let roleDefense = this.boolToCapitalBool(this.roles.defense);
        let comments = '"' + this.comments + '"';

        if(!this.teamNumber) {
            return this.notFilledOutError("Team number", "General");
        }

        let csvRow = [teamNumber, wheelType_traction, wheelType_mecanum, wheelType_omni, wheelType_2speed, wheelType_other, canHighShoot, canLowShoot, canPickupBalls, canSweepBalls, canPlaceGear, avgGears, canPickupGear, startLocationMatters, autoMove, autoShootHigh, autoShootLow, autoGear, autoGearAny, climbing, roleHighShooting, roleLowShooting, roleGears, roleDefense, comments].join(",");

        this.storage.query("INSERT INTO pitdata (csvrow) VALUES ('" + csvRow + "')").then(data => {

        }, error => {
            console.log("insert error -> " + JSON.stringify(error) + " with " + code);
        });

        this.nav.present(Toast.create({
            message: "Successfully pit scouted team " + teamNumber + ".",
            duration: 900
        }));

        return csvRow;
    }

    notFilledOutError(fieldUnfilled, section) {
        let message = "You have not filled out the field <b>" + fieldUnfilled + "</b> in the <b>" + section + "</b> section.";

        let alert = Alert.create({
            title: "Incomplete section",
            subTitle: message,
            buttons: ["Dismiss"]
        });

        this.nav.present(alert);
    }
}
