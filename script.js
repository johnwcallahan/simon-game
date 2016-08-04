$(document).ready(function() {
var gameLength = 20;
var winningSequence = generateWinningSequence(gameLength);
var strictMode = false;
var clickEnabled = false;
var roundSequence, interval;
var userSequence = [];
var roundIndex = 0;
var round = 1;

var s1Sound = new Audio(
    'https://s3.amazonaws.com/freecodecamp/simonSound1.mp3');
var s2Sound = new Audio(
    'https://s3.amazonaws.com/freecodecamp/simonSound2.mp3');
var s3Sound = new Audio(
    'https://s3.amazonaws.com/freecodecamp/simonSound3.mp3');
var s4Sound = new Audio(
    'https://s3.amazonaws.com/freecodecamp/simonSound4.mp3');
var sounds = {
    's1': s1Sound,
    's2': s2Sound,
    's3': s3Sound,
    's4': s4Sound
};
$('#reset').click(function() {
    if (clickEnabled === false) return;
    resetGame();
});
$('#strict').click(function() {
    if (strictMode === false) {
        strictMode = true;
        $('#strictLight').addClass('strictLightOn');
        $('#strict').addClass('strictOn');
    } else {
        strictMode = false;
        $('#strictLight').removeClass('strictLightOn')
        $('#strict').removeClass('strictOn');
    }
});
$('.panel').click(function() {
    if (clickEnabled === false) return;
    clickEnabled = false;
    var panel = $(this).attr('id');
    userTurn(panel);
    if (roundIndex !== 0) {
        setTimeout(function() {
            clickEnabled = true;
        }, 450)
    }
});

function generateWinningSequence(gameLength) {
    var sequence = [];
    for (var i = 0; i < gameLength; i++) {
        var random = Math.random() * 4 + 1;
        sequence.push(Math.floor(random));
    }
    return sequence;
}

function resetGame() {
    roundFlash();
    allDarkFlash();
    setTimeout(function() {
        userSequence = [];
        roundIndex = 0;
        round = 1;
        winningSequence = generateWinningSequence(gameLength);
        computerTurn();
    }, 1400);
}

function computerTurn() {
    setTimeout(function() {
        $('#round').text(roundDisplay(round));
    }, 450);
    roundSequence = winningSequence.slice(0, round);
    var counter = 0;
    var flashes = setInterval(function() {
        clickEnabled = false;
        panelFlash('s' + winningSequence[counter]);
        counter++;
        if (counter === roundSequence.length) {
            clickEnabled = true;
            clearInterval(flashes);
        }
    }, flashInterval(round));
}

function userTurn(panel) {
    roundIndex++;
    userSequence.push(parseInt(panel.slice(1)));
    if (userSequence[roundIndex - 1] !== roundSequence[roundIndex - 1]) {
        clickEnabled = false;
        return incorrectGuess(panel);
    }
    if (roundIndex === roundSequence.length && round === gameLength) {
        clickEnabled = false;
        return win(panel);
    }
    panelFlash(panel);
    if (roundIndex === roundSequence.length) {
        clickEnabled = false;
        round++;
        roundIndex = 0;
        userSequence = [];
        setTimeout(function() {
            computerTurn()
        }, 375);
    }
}

function incorrectGuess(panel) {
    var ips; //Incorrect Panel Sequence
    switch (panel) {
        case 's1':
            ips = [1, 3, 4, 2];
            break;
        case 's2':
            ips = [2, 1, 3, 4];
            break;
        case 's3':
            ips = [3, 4, 2, 1];
            break;
        case 's4':
            ips = [4, 2, 1, 3];
            break;
    }
    roundFlash();
    sounds[panel].play();
    $('#s' + ips[0]).addClass('s' + ips[0] + 'Dark');
    setTimeout(function() {
        $('#s' + ips[1]).addClass('s' + ips[1] + 'Dark');
    }, 56);
    setTimeout(function() {
        $('#s' + ips[2]).addClass('s' + ips[2] + 'Dark');
    }, 112);
    setTimeout(function() {
        $('#s' + ips[3]).addClass('s' + ips[3] + 'Dark');
    }, 225);
    setTimeout(function() {
        allNormalColors();
        if (strictMode === false) {
            $('#round').text(roundDisplay());
            roundIndex = 0;
            userSequence = [];
            computerTurn();
        } else if (strictMode === true) {
            resetGame();
        }
    }, 2200);
}

function win(panel) {
    sounds[panel].play();
    var wps; //Winning Panel Sequence
    switch (panel) {
        case 's1':
            wps = [1, 2, 4, 3];
            break;
        case 's2':
            wps = [2, 4, 3, 1];
            break;
        case 's3':
            wps = [3, 1, 2, 4];
            break;
        case 's4':
            wps = [4, 3, 1, 2];
            break;
    }
    $('#s' + wps[0]).addClass('s' + wps[0] + 'Bright');
    setTimeout(function() {
        $('#s' + wps[1]).addClass('s' + wps[1] + 'Bright');
    }, 250);
    setTimeout(function() {
        $('#s' + wps[2]).addClass('s' + wps[2] + 'Bright');
    }, 375);
    setTimeout(function() {
        $('#s' + wps[3]).addClass('s' + wps[3] + 'Bright');
    }, 500);
    setTimeout(function() {
        allBrightFlash();
        roundFlash();
    }, 900);
    setTimeout(function() {
        resetGame();
    }, 4500);
}
setTimeout(computerTurn(), 900);

//=========ANIMATION====================================================
function panelFlash(panel) {
    sounds[panel].play();
    $('#' + panel).addClass(panel + 'Bright');
    setTimeout(function() {
        $('#' + panel).removeClass(panel + 'Bright');
    }, 250);
}

function roundDisplay(round) {
    if (round < 10) {
        return '0' + round;
    } else {
        return round;
    }
}

function flashInterval(round) {
    return round < 9 ? 900 : 600;
}

function allDarken() {
    $('#s1').addClass('s1Dark');
    $('#s2').addClass('s2Dark');
    $('#s3').addClass('s3Dark');
    $('#s4').addClass('s4Dark');
}

function allNormalColors() {
    $('#s1').removeClass('s1Bright s1Dark');
    $('#s2').removeClass('s2Bright s2Dark');
    $('#s3').removeClass('s3Bright s3Dark');
    $('#s4').removeClass('s4Bright s4Dark');
}

function allBrighten() {
    $('#s1').addClass('s1Bright');
    $('#s2').addClass('s2Bright');
    $('#s3').addClass('s3Bright');
    $('#s4').addClass('s4Bright');
}

function roundFlash() {
    $('#round').text('--');
    setTimeout(function() {
      $('#round').text('!!');
      setTimeout(function() {
        $('#round').text('--');
        setTimeout(function() {
          $('#round').text('!!');
          setTimeout(function() {
            $('#round').text('--');
            setTimeout(function() {
              $('#round').text('!!');
            }, 225);
          }, 225);
        }, 225);
      }, 225);
    }, 393);
}

function allDarkFlash() {
    allDarken();
    setTimeout(function() {
      allNormalColors();
      setTimeout(function() {
        allDarken();
        setTimeout(function() {
          allNormalColors();
          setTimeout(function() {
            allDarken();
            setTimeout(function() {
              allNormalColors();
            }, 225);
          }, 225);
        }, 225);
      }, 225);
    }, 393);
}

function allBrightFlash() {
    allNormalColors();
    setTimeout(function() {
      allBrighten();
      setTimeout(function() {
        allNormalColors();
        setTimeout(function() {
          allBrighten();
          setTimeout(function() {
            allNormalColors();
            setTimeout(function() {
              allBrighten();
            }, 225);
          }, 225);
        }, 225);
      }, 225);
    }, 393)
}
});