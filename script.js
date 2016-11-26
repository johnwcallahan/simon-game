$(document).ready(function() {
  //============================================================================
  // Game parameters
  //============================================================================
  var gameLength = 20;
  var round = 1;
  var winningSequence = generateWinningSequence(gameLength);

  //Returns array of length == gameLength of random numbers between 1 and 4
  function generateWinningSequence(gameLength) {
    var sequence = [];
    for (var i = 0; i < gameLength; i++) {
      var random = (Math.random() * 4) + 1;
      sequence.push(Math.floor(random));
    }
    return sequence;
  }

  // speed that the panels flash during computer's turn (increases at round 9)
  function flashInterval(round) {
    return round < 9 ? 900 : 700;
  }

  var sounds = {
    's1': new Howl({
      src: ['https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'],
      html5: true
    }),
    's2': new Howl({
      src: ['https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'],
      html5: true
    }),
    's3': new Howl({
      src: ['https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'],
      html5: true
    }),
    's4': new Howl({
      src: ['https://s3.amazonaws.com/freecodecamp/simonSound4.mp3'],
      html5: true
    }),
  };
  var strictMode = false;
  var clickEnabled = false;

  //============================================================================
  // Interface functions
  //============================================================================

  //Reset game
  $('#reset').click(function() {
    if (!clickEnabled) return;
    resetGame();
  });

  function resetGame() {
    roundDisplayBlink();
    allDarkFlash();
    //Reset game parameters after animation
    setTimeout(function() {
      userSequence = [];
      roundIndex = 0;
      round = 1;
      winningSequence = generateWinningSequence(gameLength);
      computerTurn();
    }, 1400);
  }

  //Toggle strict mode
  $('#strict').click(function() {
    if (!strictMode) {
      strictMode = true;
      $('#strictLight').addClass('strictLightOn');
      $('#strict').addClass('strictButtonDepressed');
    } else {
      strictMode = false;
      $('#strictLight').removeClass('strictLightOn');
      $('#strict').removeClass('strictButtonDepressed');
    }
  });

  //Update round display, with 0 in front if round is single digit
  function updateRoundDisplay(round) {
    var roundDisplay;
    roundDisplay = round < 10 ? '0' + round : round;
    $('#round').text(roundDisplay);
  }

  //============================================================================
  // Game logic
  //============================================================================
  var roundSequence;

  function computerTurn() {
    //Update round display after slight delay
    setTimeout(function() {
      updateRoundDisplay(round);
    }, 450);

    //Sequence to display this round
    roundSequence = winningSequence.slice(0, round);

    //Walk through roundSequence, flashing the corresponding panels
    var counter = 0;
    var flashes = setInterval(function() {
      clickEnabled = false;
      panelFlash('s' + winningSequence[counter]);
      counter++;
      if (counter === roundSequence.length) {
        clearInterval(flashes);
        clickEnabled = true;
      }
    }, flashInterval(round));
  }

  $('.panel').click(function() {
    if (!clickEnabled) return;
    clickEnabled = false;
    var panel = $(this).attr('id');
    userGuess(panel);

    /* Safari has trouble with multiple sounds even with howler.js, so a slight
    delay has been added before enabling mouse click between guesses to help 
    offset the spotty performance */
    if (roundIndex !== 0) {
      setTimeout(function() {
        clickEnabled = true;
      }, 100);
    }
  });

  var userSequence = []; //Store the user's guesses
  var roundIndex = 0; //Keeps track of position that the user is guessing

  function userGuess(panel) {
    roundIndex++;
    userSequence.push(parseInt(panel.slice(1)));

    //If the user makes an incorrect guess
    if (userSequence[roundIndex - 1] !== roundSequence[roundIndex - 1]) {
      clickEnabled = false;
      roundIndex = 0;
      userSequence = [];
      return incorrectGuess(panel);
    }
    //If the user has successfully completed number of rounds required to win
    if (roundIndex === roundSequence.length && round === gameLength) {
      clickEnabled = false;
      return win(panel);
    }
    panelFlash(panel);

    //If the user has successfully completed the current round
    if (roundIndex === roundSequence.length) {
      clickEnabled = false;
      round++;
      roundIndex = 0;
      userSequence = [];
      setTimeout(function() {
        computerTurn();
      }, 375);
    }
  }

  function incorrectGuess(panel) {
    /* Darken the panels counter-clockwise, starting with the panel
    that the user guessed */
    var panelSeq;
    switch (panel) {
      case 's1':
        panelSeq = [1, 3, 4, 2];
        break;
      case 's2':
        panelSeq = [2, 1, 3, 4];
        break;
      case 's3':
        panelSeq = [3, 4, 2, 1];
        break;
      case 's4':
        panelSeq = [4, 2, 1, 3];
        break;
    }
    roundDisplayBlink();
    sounds[panel].play();
    $('#s' + panelSeq[0]).addClass('s' + panelSeq[0] + 'Dark');
    setTimeout(function() {
      $('#s' + panelSeq[1]).addClass('s' + panelSeq[1] + 'Dark');
    }, 56);
    setTimeout(function() {
      $('#s' + panelSeq[2]).addClass('s' + panelSeq[2] + 'Dark');
    }, 112);
    setTimeout(function() {
      $('#s' + panelSeq[3]).addClass('s' + panelSeq[3] + 'Dark');
    }, 225);

    //After animation, reset game if strict mode is on, or replay current round
    setTimeout(function() {
      allNormalColors();
      if (!strictMode) {
        $('#round').text(updateRoundDisplay());
        computerTurn();
      } else {
        resetGame();
      }
    }, 2200);
  }

  function win(panel) {
    sounds[panel].play();
    /* Lighten the panels counter-clockwise, starting with the panel
    that the user guessed */
    var panelSeq;
    switch (panel) {
      case 's1':
        panelSeq = [1, 2, 4, 3];
        break;
      case 's2':
        panelSeq = [2, 4, 3, 1];
        break;
      case 's3':
        panelSeq = [3, 1, 2, 4];
        break;
      case 's4':
        panelSeq = [4, 3, 1, 2];
        break;
    }
    $('#s' + panelSeq[0]).addClass('s' + panelSeq[0] + 'Bright');
    setTimeout(function() {
      $('#s' + panelSeq[1]).addClass('s' + panelSeq[1] + 'Bright');
    }, 250);
    setTimeout(function() {
      $('#s' + panelSeq[2]).addClass('s' + panelSeq[2] + 'Bright');
    }, 375);
    setTimeout(function() {
      $('#s' + panelSeq[3]).addClass('s' + panelSeq[3] + 'Bright');
    }, 500);
    setTimeout(function() {
      allBrightFlash();
      roundDisplayBlink();
    }, 900);

    //After animation, reset game
    setTimeout(function() {
      resetGame();
    }, 4500);
  }

  //=============================================================================
  // Animations
  //=============================================================================

  //Flash single panel and play sound
  function panelFlash(panel) {
    sounds[panel].play();
    $('#' + panel).addClass(panel + 'Bright');
    setTimeout(function() {
      $('#' + panel).removeClass(panel + 'Bright');
    }, 250);
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

  function roundDisplayBlink() {
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
    }, 393);
  }

  //=============================================================================
  // Start game on page load after 900ms
  //=============================================================================
  setTimeout(computerTurn(), 900);
});