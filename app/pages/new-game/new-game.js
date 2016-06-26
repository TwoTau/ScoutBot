import {Page, NavController, Alert, Storage, SqlStorage} from 'ionic-angular';

@Page({
    templateUrl: 'build/pages/new-game/new-game.html'
})

export class NewGamePage {
    static get parameters() {
        return [[NavController]];
    }

    constructor(nav) {
        this.nav = nav;
        this.storage = new Storage(SqlStorage);

        this.gameMode = "pre";

        this.storage.get("colorNumber").then((colorNumber) => {
            this.colorNumber = (colorNumber === undefined) ? "Red 1" : colorNumber;
            this.navbarColor = this.colorNumber.split(" ")[0].toLowerCase();
        });

        this.storage.get("scout").then((name) => {
            this.scout = (name === undefined) ? "Scout" : name;
        });

        this.defenseA = "Defense A";
        this.defenseB = "Defense B";
        this.defenseC = "Defense C";
        this.defenseD = "Defense D";
    }

    makeQR() {
        if(this.defenseA === "Defense A") {
            this.notFilledOutError("Defense A", "Pregame");
        } if(this.defenseA === "Defense B") {
            this.notFilledOutError("Defense B", "Pregame");
        } if(this.defenseA === "Defense C") {
            this.notFilledOutError("Defense C", "Pregame");
        } if(this.defenseA === "Defense D") {
            this.notFilledOutError("Defense D", "Pregame");
        }
        qr.canvas({
            canvas: document.getElementById("qrCode"),
            value: this.getText()
        });
    }

    notFilledOutError(fieldUnfilled, section) {
        let message = "You have not filled out the field '" + fieldUnfilled + "'. in the '" + section + "' section";
        this.nav.present(Alert.create({
            title: "Incomplete section",
            subTitle: message,
            buttons: ["Dismiss"]
        }));
    }

    getText() {
        let scoutInfo = {
            color: this.colorNumber[0] === "R" ? 0 : 3,
            number: +this.colorNumber.slice(-1),
            name: this.scout
        };

        let defenseA = this.defenseA === "Portcullis" ? 0 : 1;
        let defenseB = this.defenseB === "Moat" ? 0 : 1;
        let defenseC = this.defenseC === "Drawbridge" ? 0 : 1;
        let defenseD = this.defenseD === "Rock Wall" ? 0 : 1;

        let stuff = [
            scoutInfo.color + scoutInfo.number,
            scoutInfo.name,
            defenseA,
            defenseB,
            defenseC,
            defenseD
        ];
        console.log(stuff.join(","));
        return stuff.join(",");
    }
}
