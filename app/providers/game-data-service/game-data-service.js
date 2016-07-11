import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()

export class GameDataService {
    static get parameters(){
        return [[Http]]
    }

    constructor(http) {
        this.http = http;
        this.data = null;
    }

    // Pad the string with 0s at the beginning
    pad(originalString, desiredLength) {
        while(originalString.length < desiredLength) {
            originalString = "0" + originalString;
        }
        return originalString;
    }

    // Returns a boolean
    binToBool(binaryString) {
        return binaryString === "1";
    }

    // Returns an array of booleans
    hexToBoolArray(hexString, numBooleans) {
        let boolString = parseInt(hexString, 16).toString(2);
        boolString = this.pad(boolString, numBooleans);
        let boolArray = boolString.split("");
        for(let i = 0; i < boolArray.length; i++) {
            boolArray[i] = (boolArray[i] === "1");
        }
        return boolArray;
    }

    base36ToDec(base36Num) {
        return parseInt(base36Num, 36).toString(10);
    }

    // Returns a string
    boolToBin(booleanValue) {
        return booleanValue ? "1" : "0";
    }

    // Returns a hexadecimal string
    binToHex(binaryString) {
        return parseInt(binaryString, 2).toString(16);
    }

    // Parameter base10Num can be either a string or an integer
    // Returns a base 36 string
    decToBase36(base10Num) {
        return parseInt(base10Num, 10).toString(36);
    }

    // Parameters: teamNumber, scoutColorNumber, scoutName, foul, deadBot, defenses, autonomousDefense, autonomousSuccessful, autoBallGrabbed, autoHighGoal, autoLowGoal, goals, endgame, roles
    encode(options) {
        let teamNumber = this.pad(options.teamNumber + "", 4);

        let scoutInfo = {
            color: options.scoutColorNumber[0] === "R" ? 0 : 3,
            number: +options.scoutColorNumber.slice(-1),
            name: options.scoutName
        };

        let foul = this.boolToBin(options.foul);
        let deadBot = this.boolToBin(options.deadBot);

        let defenseA = {
            name: this.boolToBin(options.defenses.a.name === "Cheval de Frise"),
            makes: this.decToBase36(options.defenses.a.makes),
            misses: this.decToBase36(options.defenses.a.misses)
        };
        let defenseB = {
            name: this.boolToBin(options.defenses.b.name === "Ramparts"),
            makes: this.decToBase36(options.defenses.b.makes),
            misses: this.decToBase36(options.defenses.b.misses)
        };
        let defenseC = {
            name: this.boolToBin(options.defenses.c.name === "Sally Port"),
            makes: this.decToBase36(options.defenses.c.makes),
            misses: this.decToBase36(options.defenses.c.misses)
        };
        let defenseD = {
            name: this.boolToBin(options.defenses.d.name === "Rough Terrain"),
            makes: this.decToBase36(options.defenses.d.makes),
            misses: this.decToBase36(options.defenses.d.misses)
        };

        let autonomousDefense = "N";
        if(options.autonomousDefense === "A") autonomousDefense = 0;
        if(options.autonomousDefense === "B") autonomousDefense = 2;
        if(options.autonomousDefense === "C") autonomousDefense = 4;
        if(options.autonomousDefense === "D") autonomousDefense = 6;
        if(options.autonomousDefense === "E") autonomousDefense = 8;
        if(options.autonomousSuccessful) autonomousDefense++;

        let autoBallGrabbed = this.boolToBin(options.autoBallGrabbed);
        let autoHighGoal = this.boolToBin(options.autoHighGoal);
        let autoLowGoal = this.boolToBin(options.autoLowGoal);

        let lowbarMade = this.boolToBin(options.defenses.e.made);

        let teleopHighGoal = {
            makes: options.goals.high.makes,
            misses: options.goals.high.misses
        };

        let teleopLowGoal = {
            makes: options.goals.low.makes,
            misses: options.goals.low.misses
        };

        let endgame = {
            challengedTower: this.boolToBin(options.endgame.challengedTower),
            scaled: this.boolToBin(options.endgame.scaled)
        };

        let roles = {
            highShooting: this.boolToBin(options.roles.highShooting),
            lowShooting: this.boolToBin(options.roles.lowShooting),
            breaching: this.boolToBin(options.roles.breaching),
            defending: this.boolToBin(options.roles.defending)
        };

        let final = teamNumber +
        (scoutInfo.color + scoutInfo.number) +
        this.binToHex(foul + deadBot) +
        this.binToHex(defenseA.name + defenseB.name + defenseC.name + defenseD.name) +
        autonomousDefense +
        this.binToHex(autoBallGrabbed + autoHighGoal + autoLowGoal) +
        defenseA.makes +
        defenseA.misses +
        defenseB.makes +
        defenseB.misses +
        defenseC.makes +
        defenseC.misses +
        defenseD.makes +
        defenseD.misses +
        lowbarMade +
        this.decToBase36(teleopHighGoal.makes) +
        this.decToBase36(teleopHighGoal.misses) +
        this.decToBase36(teleopLowGoal.makes) +
        this.decToBase36(teleopLowGoal.misses) +
        this.binToHex(endgame.challengedTower + endgame.scaled) +
        this.binToHex(roles.highShooting + roles.lowShooting + roles.breaching + roles.defending) +
        scoutInfo.name;

        console.log(final);
        return final;
    }

    decode(encodedString) {
        let teamNumber = +encodedString.slice(0,4);

        let colorNumberArray = ["Red 1", "Red 2", "Red 3", "Blue 1", "Blue 2", "Blue 3"];
        let scoutColorNumber = colorNumberArray[+encodedString.slice(4,5) - 1];

        let foulDeadBot = this.hexToBoolArray(encodedString.slice(5, 6), 2);
        let foul = foulDeadBot[0];
        let deadBot = foulDeadBot[1];

        let defensesNameArray = this.hexToBoolArray(encodedString.slice(6, 7), 4);
        let defenses = {
            a: {
                name: defensesNameArray[0] ? "Cheval de Frise" : "Portcullis"
            },
            b: {
                name: defensesNameArray[1] ? "Ramparts" : "Moat"
            },
            c: {
                name: defensesNameArray[2] ? "Sally Port" : "Drawbridge"
            },
            d: {
                name: defensesNameArray[3] ? "Rough Terrain" : "Rock Wall"
            },
            e: {
                name: "Lowbar"
            }
        };

        let autonomousDefense = encodedString.slice(7, 8);
        let autonomousSuccessful = false;
        if(autonomousDefense === "N") {
            autonomousDefense = "None";
        } else {
            let letterArray = ["a", "b", "c", "d", "e"];
            let autonomousDefenseLetter = letterArray[+autonomousDefense / 2];
            autonomousDefense = defenses[autonomousDefenseLetter];
            if(+autonomousDefense % 2 === 1) { // odd
                autonomousSuccessful = true;
            }
        }

        let final = {
            teamNumber: teamNumber,
            scoutColorNumber: scoutColorNumber,
            foul: foul,
            deadBot: deadBot,
            defenses: defenses,
            autonomousDefense: autonomousDefense,
            autonomousSuccessful: autonomousSuccessful
        };

        return final;
    }
}
