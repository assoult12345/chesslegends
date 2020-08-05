module.exports = class Rankpoints{
    constructor(){
        //has functions that take mrr and put out: translatedrank, translatedrating
        this.RP = this;
    }

    getTranslatedRating(mmr){
        let RP = new Number(0);

        if(mmr < 201){
            //BRONZE 5
            RP = Math.floor(((mmr-1)/2)+1);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 200 && mmr < 401){
            //BRONZE 4
            RP = Math.floor(((mmr-201)/2)+101);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 400 && mmr < 601){
            //BRONZE 3
            RP = Math.floor(((mmr-401)/2)+201);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 600 && mmr < 801){
            //BRONZE 2
            RP = Math.floor(((mmr-601)/2)+301);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 800 && mmr < 1001){
            //BRONZE 1
            RP = Math.floor(((mmr-801)/2)+401);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        }  else if(mmr > 1000 && mmr < 1121){
            //SILVER 5
            RP = Math.floor(((mmr-1001)/1.2)+501);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1120 && mmr < 1241){
            //SILVER 4
            RP = Math.floor(((mmr-1121)/1.2)+601);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1240 && mmr < 1361){
            //SILVER 3
            RP = Math.floor(((mmr-1241)/1.2)+701);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1360 && mmr < 1481){
            //SILVER 2
            RP = Math.floor(((mmr-1361)/1.2)+801);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1480 && mmr < 1601){
            //SILVER 1
            RP = Math.floor(((mmr-1481)/1.2)+901);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1600 && mmr < 1681){
            //GOLD 5
            RP = Math.floor(((mmr-1601)/0.8)+1001);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1680 && mmr < 1761){
            //GOLD 4
            RP = Math.floor(((mmr-1681)/0.8)+1101);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1760 && mmr < 1841){
            //GOLD 3
            RP = Math.floor(((mmr-1761)/0.8)+1201);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1840 && mmr < 1921){
            //GOLD 2
            RP = Math.floor(((mmr-1841)/0.8)+1301);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 1920 && mmr < 2001){
            //GOLD 1
            RP = Math.floor(((mmr-1921)/0.8)+1401);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2000 && mmr < 2081){
            //PLATINUM 5
            RP = Math.floor(((mmr-2001)/0.8)+1501);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2080 && mmr < 2161){
            //PLATINUM 4
            RP = Math.floor(((mmr-2081)/0.8)+1601);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2160 && mmr < 2241){
            //PLATINUM 3
            RP = Math.floor(((mmr-2161)/0.8)+1701);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2240 && mmr < 2321){
            //PLATINUM 2
            RP = Math.floor(((mmr-2241)/0.8)+1801);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2320 && mmr < 2401){
            //PLATINUM 1
            RP = Math.floor(((mmr-2321)/0.8)+1901);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2400 && mmr < 2501){
            //DIAMOND 5
            RP = Math.floor(((mmr-2401)*1)+2001);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2500 && mmr < 2601){
            //DIAMOND 4
            RP = Math.floor(((mmr-2501)*1)+2101);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2600 && mmr < 2702){
            //DIAMOND 3
            RP = Math.floor(((mmr-2601)*1)+2201);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2700 && mmr < 2801){
            //DIAMOND 2
            RP = Math.floor(((mmr-2701)*1)+2301);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2800 && mmr < 2901){
            //DIAMOND 1
            RP = Math.floor(((mmr-2801)*1)+2401);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 2900 && mmr < 3001){
            //GRANDMASTER
            RP = Math.floor(((mmr-2901)*1)+2501);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        } else if(mmr > 3000){
            //SUPER GRANDMASTER
            RP = Math.floor(((mmr-3000)*1)+2601);
            //console.log('[ ' + mmr + ' ] MMR is: [ ' + RP + ' ] RP');
            return RP;
        }
    }

    getTranslatedRank(rp){
        let rank = '';

        if(rp < 101){
            //BRONZE 5
            rank = 'BRONZE5';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 100 && rp < 201){
            //BRONZE 4
            rank = 'BRONZE4';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 200 && rp < 301){
            //BRONZE 3
            rank = 'BRONZE3';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 300 && rp < 401){
            //BRONZE 2
            rank = 'BRONZE2';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 400 && rp < 501){
            //BRONZE 1
            rank = 'BRONZE1';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 500 && rp < 601){
            //SILVER 5
            rank = 'SILVER5';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 600 && rp < 701){
            //SILVER 4
            rank = 'SILVER4';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 700 && rp < 801){
            //SILVER 3
            rank = 'SILVER3';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 800 && rp < 901){
            //SILVER 2
            rank = 'SILVER2';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 900 && rp < 1001){
            //SILVER 1
            rank = 'SILVER1';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1000 && rp < 1101){
            //GOLD 5
            rank = 'GOLD5';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1100 && rp < 1201){
            //GOLD 4
            rank = 'GOLD4';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1200 && rp < 1301){
            //GOLD 3
            rank = 'GOLD3';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1300 && rp < 1401){
            //GOLD 2
            rank = 'GOLD2';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1400 && rp < 1501){
            //GOLD 1
            rank = 'GOLD1';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1500 && rp < 1601){
            //PLATINUM 5
            rank = 'PLATINUM5';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1600 && rp < 1701){
            //PLATINUM 4
            rank = 'PLATINUM4';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1700 && rp < 1801){
            //PLATINUM 3
            rank = 'PLATINUM3';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1800 && rp < 1901){
            //PLATINUM 2
            rank = 'PLATINUM2';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 1900 && rp < 2001){
            //PLATINUM 1
            rank = 'PLATINUM1';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 2000 && rp < 2101){
            //DIAMOND 5
            rank = 'DIAMOND5';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 2100 && rp < 2201){
            //DIAMOND 4
            rank = 'DIAMOND4';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 2200 && rp < 2301){
            //DIAMOND 3
            rank = 'DIAMOND3';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 2300 && rp < 2401){
            //DIAMOND 2
            rank = 'DIAMOND2';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 2400 && rp < 2501){
            //DIAMOND 1
            rank = 'DIAMOND1';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 2500 && rp < 2601){
            //DIAMOND 1
            rank = 'GRANDMASTER';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        } else if(rp > 2600){
            //DIAMOND 1
            rank = 'SUPER GRANDMASTER';
            //console.log(rp + ' RP is rank ' + rank);
            return rank;
        }
    }

    getRemainderRP(rp){
        let remainRP = new Number(0);

        if(rp < 101){
            //BRONZE 5
            remainRP = rp;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 100 && rp < 201){
            //BRONZE 4
            remainRP = rp-100;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 200 && rp < 301){
            //BRONZE 3
            remainRP = rp-200;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 300 && rp < 401){
            //BRONZE 2
            remainRP = rp-300;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 400 && rp < 501){
            //BRONZE 1
            remainRP = rp-400;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 500 && rp < 601){
            //SILVER 5
            remainRP = rp-500;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 600 && rp < 701){
            //SILVER 4
            remainRP = rp-600;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 700 && rp < 801){
            //SILVER 3
            remainRP = rp-700;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 800 && rp < 901){
            //SILVER 2
            remainRP = rp-800;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 900 && rp < 1001){
            //SILVER 1
            remainRP = rp-900;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1000 && rp < 1101){
            //GOLD 5
            remainRP = rp-1000;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1100 && rp < 1201){
            //GOLD 4
            remainRP = rp-1100;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1200 && rp < 1301){
            //GOLD 3
            remainRP = rp-1200;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1300 && rp < 1401){
            //GOLD 2
            remainRP = rp-1300;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1400 && rp < 1501){
            //GOLD 1
            remainRP = rp-1400;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1500 && rp < 1601){
            //PLATINUM 5
            remainRP = rp-1500;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1600 && rp < 1701){
            //PLATINUM 4
            remainRP = rp-1600;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1700 && rp < 1801){
            //PLATINUM 3
            remainRP = rp-1700;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1800 && rp < 1901){
            //PLATINUM 2
            remainRP = rp-1800;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 1900 && rp < 2001){
            //PLATINUM 1
            remainRP = rp-1900;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 2000 && rp < 2101){
            //DIAMOND 5
            remainRP = rp-2000;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 2100 && rp < 2201){
            //DIAMOND 4
            remainRP = rp-2100;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 2200 && rp < 2301){
            //DIAMOND 3
            remainRP = rp-2200;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 2300 && rp < 2401){
            //DIAMOND 2
            remainRP = rp-2300;
            //console.log('remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 2400 && rp < 2501){
            //DIAMOND 1
            remainRP = rp-2400;
            //console.log('d1remainRP ' + remainRP);
            return remainRP;
        } else if(rp > 2500 && rp < 2601){
            //GRANDMASTER
            remainRP = rp-2500;
            //console.log('gmremainRP ' + remainRP);
            return remainRP;
        } else if(rp > 2600){
            //GRANDMASTER
            remainRP = rp-2600;
            //console.log('sgmremainRP ' + remainRP);
            return remainRP;
        }
    }

    getNewBadge(rank){
        let clearRank = new String();
        let badgeIndex = new Number();

       // console.log(rank + ' rank from gernewbadge');

        if(rank == 'BRONZE5'){
            clearRank = 'BRONZE';
        } else if(rank == 'BRONZE4'){
            clearRank = 'BRONZE';
        } else if(rank == 'BRONZE3'){
            clearRank = 'BRONZE';
        } else if(rank == 'BRONZE2'){
            clearRank = 'BRONZE';
        } else if(rank == 'BRONZE2'){
            clearRank = 'BRONZE';
        } else if(rank == 'BRONZE1'){
            clearRank = 'BRONZE';
        } else if(rank == 'SILVER5'){
            clearRank = 'SILVER';
        } else if(rank == 'SILVER4'){
            clearRank = 'SILVER';
        } else if(rank == 'SILVER3'){
            clearRank = 'SILVER';
        } else if(rank == 'SILVER2'){
            clearRank = 'SILVER';
        } else if(rank == 'SILVER1'){
            clearRank = 'SILVER';
        } else if(rank == 'GOLD5'){
            clearRank = 'GOLD';
        } else if(rank == 'GOLD4'){
            clearRank = 'GOLD';
        } else if(rank == 'GOLD3'){
            clearRank = 'GOLD';
        } else if(rank == 'GOLD2'){
            clearRank = 'GOLD';
        } else if(rank == 'GOLD1'){
            clearRank = 'GOLD';
        } else if(rank == 'PLATINUM5'){
            clearRank = 'PLATINUM';
        } else if(rank == 'PLATINUM4'){
            clearRank = 'PLATINUM';
        } else if(rank == 'PLATINUM3'){
            clearRank = 'PLATINUM';
        } else if(rank == 'PLATINUM2'){
            clearRank = 'PLATINUM';
        } else if(rank == 'PLATINUM1'){
            clearRank = 'PLATINUM';
        } else if(rank == 'DIAMOND5'){
            clearRank = 'DIAMOND';
        } else if(rank == 'DIAMOND4'){
            clearRank = 'DIAMOND';
        } else if(rank == 'DIAMOND3'){
            clearRank = 'DIAMOND';
        } else if(rank == 'DIAMOND2'){
            clearRank = 'DIAMOND';
        } else if(rank == 'DIAMOND1'){
            clearRank = 'DIAMOND';
        } else if(rank == 'GRANDMASTER'){
            clearRank = 'GRANDMASTER';
        } else if(rank == 'SUPER GRANDMASTER'){
            clearRank = 'SUPER GRANDMASTER';
        }

       // console.log(clearRank + ' clearrank from getnewbadge');

        if(clearRank == 'BRONZE'){
            badgeIndex = 2;
            return badgeIndex;
        } else if(clearRank == 'SILVER'){
            badgeIndex = 3;
            return badgeIndex;
        } else if(clearRank == 'GOLD'){
            badgeIndex = 4;
            return badgeIndex;
        } else if(clearRank == 'PLATINUM'){
            badgeIndex = 5;
            return badgeIndex;
        } else if(clearRank == 'DIAMOND'){
            badgeIndex = 6;
            return badgeIndex;
        } else if(clearRank == 'GRANDMASTER'){
            badgeIndex = 7;
            return badgeIndex;
        } else if(clearRank == 'SUPER GRANDMASTER'){
            badgeIndex = 8;
            return badgeIndex;
        }
    }
}