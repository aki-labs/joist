// Copyright 2021, University of Colorado Boulder

/**
 * An item for the Toolbar that includes components related to the voicing feature. Includes a switch to
 * enable/disable all speech, and buttons to hear overview information about the active sim Screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import merge from '../../../phet-core/js/merge.js';
import VoicingHighlight from '../../../scenery-phet/js/accessibility/speaker/VoicingHighlight.js';
import PlayStopButton from '../../../scenery-phet/js/buttons/PlayStopButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import VoicingText from '../../../scenery-phet/js/accessibility/speaker/VoicingText.js';
import voicingManager from '../../../scenery/js/accessibility/speaker/voicingManager.js';
import webSpeaker from '../../../scenery/js/accessibility/speaker/webSpeaker.js';
import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';
import PreferencesToggleSwitch from '../preferences/PreferencesToggleSwitch.js';

// constants
const CONTENT_VERTICAL_SPACING = 10;
const QUICK_INFO = 20;

// strings
const titleString = 'Sim Voicing';
const quickInfoString = 'Quick Info';
const overviewString = 'Overview';
const detailsString = 'Details';
const hintString = 'Hint';
const simVoicingOnString = 'Sim Voicing on.';
const simVoicingOffString = 'Sim Voicing off.';
const toolbarString = 'Toolbar';
const playOverviewString = 'Play Overview';
const playDetailsString = 'Play Details';
const playHintString = 'Play Hint';

class VoicingToolbarItem extends Node {

  /**
   * @param {VoicingToolbarAlertManager} alertManager - generates the alert content when buttons are pressed
   * @param {LookAndFeel} lookAndFeel
   */
  constructor( alertManager, lookAndFeel ) {

    const titleTextOptions = {
      font: new PhetFont( 14 ),
      fill: lookAndFeel.navigationBarTextFillProperty
    };

    const contentFontOptions = {
      font: new PhetFont( 12 ),
      fill: lookAndFeel.navigationBarTextFillProperty
    };

    const titleText = new Text( titleString, titleTextOptions );
    const quickInfoText = new VoicingText( quickInfoString, titleTextOptions );
    quickInfoText.focusHighlight = new VoicingHighlight( quickInfoText, {

      // the inner stroke is white since the toolbar is on a black background
      // NOTE: This will need to use lookAndFeel probably
      innerStroke: 'white'
    } );

    // layout
    const labelAlignGroup = new AlignGroup();
    const inputAlignGroup = new AlignGroup();

    // Creates an input element with the provided label string, adding Text and the input element to AlignGroups
    // so that labels and inputs will each align
    const createLabelledInput = ( labelString, inputElement ) => {
      const textLabel = new Text( labelString, contentFontOptions );
      const labelBox = labelAlignGroup.createBox( textLabel, { xAlign: 'left' } );
      const inputBox = inputAlignGroup.createBox( inputElement, { align: 'right' } );

      // voicing
      inputElement.voicingCreateO = event => { if ( event.type === 'focus' ) { return labelString; } };

      return new HBox( { children: [ labelBox, inputBox ], spacing: CONTENT_VERTICAL_SPACING } );
    };

    const muteSpeechSwitch = new PreferencesToggleSwitch( voicingManager.mainWindowVoicingEnabledProperty, false, true, {
      labelNode: titleText,
      a11yLabel: 'Sim Voicing',
      toggleSwitchOptions: {
        voicingUtteranceQueue: phet.joist.sim.joistVoicingUtteranceQueue
      }
    } );

    const playPauseButtonOptions = { radius: 12 };

    const playingOverviewProperty = new BooleanProperty( false );
    const overviewButton = new PlayStopButton( playingOverviewProperty, merge( {
      startPlayingLabel: playOverviewString
    }, playPauseButtonOptions ) );
    const overviewRow = createLabelledInput( overviewString, overviewButton );
    const overviewUtterance = new Utterance();

    const playingDetailsProperty = new BooleanProperty( false );
    const detailsButton = new PlayStopButton( playingDetailsProperty, merge( {
      startPlayingLabel: playDetailsString
    }, playPauseButtonOptions ) );
    const detailsRow = createLabelledInput( detailsString, detailsButton );
    const detailsUtterance = new Utterance();

    const playingHintProperty = new BooleanProperty( false );
    const hintButton = new PlayStopButton( playingHintProperty, merge( {
      startPlayingLabel: playHintString
    }, playPauseButtonOptions ) );
    const hintRow = createLabelledInput( hintString, hintButton );
    const hintUtterance = new Utterance();

    super( {
      children: [ muteSpeechSwitch, quickInfoText, overviewRow, detailsRow, hintRow ],
      spacing: CONTENT_VERTICAL_SPACING,
      align: 'left',

      // pdom
      tagName: 'section',
      labelTagName: 'h2',
      labelContent: toolbarString
    } );

    // layout
    quickInfoText.leftTop = muteSpeechSwitch.leftBottom.plusXY( 0, CONTENT_VERTICAL_SPACING );
    overviewRow.leftTop = quickInfoText.leftBottom.plusXY( QUICK_INFO, CONTENT_VERTICAL_SPACING );
    detailsRow.leftTop = overviewRow.leftBottom.plusXY( 0, CONTENT_VERTICAL_SPACING );
    hintRow.leftTop = detailsRow.leftBottom.plusXY( 0, CONTENT_VERTICAL_SPACING );

    const playingProperties = [ playingOverviewProperty, playingDetailsProperty, playingHintProperty ];

    /**
     * Play the content for a particular button/associated Property.
     * @param {BooleanProperty} playingProperty
     * @param {Utterance} utterance
     * @param {string} alertContent
     */
    const playContent = ( playingProperty, utterance, alertContent ) => {

      if ( playingProperty.value ) {

        // when one button is pressed, immediately stop any other buttons, only one should be playing at a time
        const otherProperties = _.without( playingProperties, playingProperty );
        otherProperties.forEach( property => {
          property.value = false;
        } );

        utterance.alert = alertContent;
        phet.joist.sim.joistVoicingUtteranceQueue.addToBack( utterance );
      }
      else {
        webSpeaker.cancel();
      }
    };

    playingOverviewProperty.lazyLink( playingOverview => { playContent( playingOverviewProperty, overviewUtterance, alertManager.createOverviewContent() ); } );
    playingDetailsProperty.lazyLink( playingDetails => { playContent( playingDetailsProperty, detailsUtterance, alertManager.createDetailsContent() ); } );
    playingHintProperty.lazyLink( playingHint => { playContent( playingHintProperty, hintUtterance, alertManager.createHintContent() ); } );

    voicingManager.mainWindowVoicingEnabledProperty.lazyLink( enabled => {
      const alert = enabled ? simVoicingOnString : simVoicingOffString;
      phet.joist.sim.utteranceQueue.addToBack( alert );
      phet.joist.sim.joistVoicingUtteranceQueue.addToBack( alert );
    } );

    // if the webSpeaker starts speaking any Utterance that is not one of the Utterances for this content,
    // stop speech for each button
    webSpeaker.endSpeakingEmitter.addListener( endedUtterance => {
      if ( endedUtterance === overviewUtterance ) {
        playingOverviewProperty.set( false );
      }
      if ( endedUtterance === hintUtterance ) {
        playingHintProperty.set( false );
      }
      if ( endedUtterance === detailsUtterance ) {
        playingDetailsProperty.set( false );
      }
    } );
  }
}

joist.register( 'VoicingToolbarItem', VoicingToolbarItem );
export default VoicingToolbarItem;
