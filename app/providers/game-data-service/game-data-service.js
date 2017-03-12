import {Injectable} from '@angular/core';

@Injectable()

export class GameDataService {
    static get parameters() {
        return;
    }

    constructor() {

    }

    // Pad the string with 0s at the beginning
    pad(originalString, desiredLength) {
        while(originalString.length < desiredLength) {
            originalString = "0" + originalString;
        }
        return originalString;
    }

    // Returns a boolean as a capitalized string
    binToBool(binaryString) {
        return (binaryString === "1") ? "TRUE" : "FALSE";
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
        return +(parseInt(base36Num, 36).toString(10));
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

    attemptSuccessTernaryToString(ternaryString) {
        ternaryString = +ternaryString;
        if(ternaryString === 0) {
            ternaryString = "Did not attempt";
        } else if(ternaryString === 1) {
            ternaryString = "Attempt";
        } else if(ternaryString === 2) {
            ternaryString = "Success";
        }
        return ternaryString;
    }

    encode(options) {
        let teamNumber = options.teamNumber;
        let scoutColorNumber = options.scoutColorNumber;
        let scoutName = options.scoutName;
        let matchNumber = options.matchNumber;

        let foul = this.boolToBin(options.foul);
        let deadBot = this.boolToBin(options.deadBot);

        let startingPosition = options.startingPosition;
        let startsWithGear = this.boolToBin(options.startsWithGear);
        let startsWithBalls = this.boolToBin(options.startsWithBalls);

        let crossedBaseline = this.boolToBin(options.crossedBaseline);
        let autoGear = options.autoGear;
        let autoGearLocation = options.autoGearLocation;
        if(!autoGearLocation) {
            autoGearLocation = "0";
        }
        let autoBallGrabbed = this.boolToBin(options.autoBallGrabbed);
        let autoHighGoal = options.autoHighGoal;
        let autoLowGoal = options.autoLowGoal;

        let gearsMakes = options.gears.makes;
        let gearsMisses = options.gears.misses;

        let goalsHighMakes = options.goals.high.makes;
        let goalsHighMisses = options.goals.high.misses;
        let goalsLowMakes = options.goals.low.makes;
        let goalsLowMisses = options.goals.low.misses;

        let scaling = this.attemptSuccessTernaryToString(options.scaling);

        let rolesHighShooting = this.boolToBin(options.roles.highShooting);
        let rolesLowShooting = this.boolToBin(options.roles.lowShooting);
        let rolesGears = this.boolToBin(options.roles.gears);
        let rolesDefending = this.boolToBin(options.roles.defense);

        let comments = options.comments;

        return [teamNumber, scoutColorNumber, scoutName, matchNumber, foul, deadBot, startingPosition, startsWithGear, startsWithBalls, crossedBaseline, autoGear, autoGearLocation, autoBallGrabbed, autoHighGoal, autoLowGoal, gearsMakes, gearsMisses, goalsHighMakes, goalsHighMisses, goalsLowMakes, goalsLowMisses, scaling, rolesHighShooting, rolesLowShooting, rolesGears, rolesDefending, comments].join(",");
    }

    decode(encodedString) {
        let result = encodedString.split(",");

        let teamNumber = +result[0];
        let scoutColorNumber = result[1];
        let scoutName = result[2];
        let matchNumber = +result[3];

        let foul = this.binToBool(result[4]);
        let deadBot = this.binToBool(result[5]);

        let startingPosition = +result[6];
        if(startingPosition === 1) {
            startingPosition = "Boiler";
        } else if(startingPosition === 2) {
            startingPosition = "Middle";
        } else if(startingPosition === 3) {
            startingPosition = "Return Loading station";
        }
        let startsWithGear = this.binToBool(result[7]);
        let startsWithBalls = this.binToBool(result[8]);

        let crossedBaseline = this.binToBool(result[9]);
        let autoGear = this.attemptSuccessTernaryToString(result[10]);
        let autoGearLocation = result[11];
        if(autoGear === "Did not attempt") {
            autoGearLocation = "N/A";
        }
        let autoBallGrabbed = this.binToBool(result[12]);
        let autoHighGoal =  this.attemptSuccessTernaryToString(result[13]);
        let autoLowGoal =  this.attemptSuccessTernaryToString(result[14]);

        let gearsMakes = result[15];
        let gearsMisses = result[16];

        let goalsHighMakes = result[17];
        let goalsHighMisses = result[18];
        let goalsLowMakes = result[19];
        let goalsLowMisses = result[20];

        let scaling = this.attemptSuccessTernaryToString(result[21]);

        let rolesHighShooting = this.binToBool(result[22]);
        let rolesLowShooting = this.binToBool(result[23]);
        let rolesGears = this.binToBool(result[24]);
        let rolesDefending = this.binToBool(result[25]);

        let comments = '"' + result[26] + '"';

        let csvRowArray = [teamNumber, scoutColorNumber, scoutName, matchNumber, foul, deadBot, startingPosition, startsWithGear, startsWithBalls, crossedBaseline, autoGear, autoGearLocation, autoBallGrabbed, autoHighGoal, autoLowGoal, gearsMakes, gearsMisses, goalsHighMakes, goalsHighMisses, goalsLowMakes, goalsLowMisses, scaling, rolesHighShooting, rolesLowShooting, rolesGears, rolesDefending, comments];

        return {
            teamNumber: teamNumber,
            scoutName: scoutName,
            matchNumber: matchNumber,
            csvRowArray: csvRowArray
        };
    }

    isValid(dataString) {
        return true;
    }
}
