// Copyright 2021, University of Colorado Boulder

/**
 * An item for the Toolbar that includes components related to the self-voicing feature. Includes a switch to
 * enable/disable all speech, and buttons to hear overview information about the active sim Screen.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import PlayStopButton from '../../../scenery-phet/js/buttons/PlayStopButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import webSpeaker from '../../../scenery/js/accessibility/speaker/webSpeaker.js';
import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import ToggleSwitch from '../../../sun/js/ToggleSwitch.js';
import Utterance from '../../../utterance-queue/js/Utterance.js';
import joist from '../joist.js';

// constants
const CONTENT_SPACING = 10;

// strings
const titleString = 'Voicing';
const speechString = 'Speech';
const overviewString = 'Overview';
const detailsString = 'Details';
const hintString = 'Hint';

class SelfVoicingToolbarItem extends VBox {

  /**
   * @param {VoicingToolbarAlertManager} alertManager - generates the alert content when buttons are pressed
   * @param {LookAndFeel} lookAndFeel
   */
  constructor( alertManager, lookAndFeel ) {

    const titleText = new Text( titleString, {
      font: new PhetFont( 14 ),
      fill: lookAndFeel.navigationBarTextFillProperty
    } );

    const contentFontOptions = {
      font: new PhetFont( 12 ),
      fill: lookAndFeel.navigationBarTextFillProperty
    };

    // layout
    const labelAlignGroup = new AlignGroup();
    const inputAlignGroup = new AlignGroup();

    // Creates an input element with the provided label string, adding Text and the input element to AlignGroups
    // so that labels and inputs will each align
    const createLabelledInput = ( labelString, inputElement ) => {
      const textLabel = new Text( labelString, contentFontOptions );
      const labelBox = labelAlignGroup.createBox( textLabel, { xAlign: 'left' } );
      const inputBox = inputAlignGroup.createBox( inputElement, { align: 'right' } );
      return new HBox( { children: [ labelBox, inputBox ], spacing: CONTENT_SPACING } );
    };

    const muteSpeechSwitch = new ToggleSwitch( webSpeaker.speechEnabledProperty, false, true, {
      size: new Dimension2( 30, 15 ),
      trackFillRight: '#64bd5a'
    } );
    const speechRow = createLabelledInput( speechString, muteSpeechSwitch );

    const playPauseButtonOptions = { radius: 12 };

    const playingOverviewProperty = new BooleanProperty( false );
    const overviewButton = new PlayStopButton( playingOverviewProperty, playPauseButtonOptions );
    const overviewRow = createLabelledInput( overviewString, overviewButton );
    const overviewUtterance = new Utterance();

    const playingDetailsProperty = new BooleanProperty( false );
    const detailsButton = new PlayStopButton( playingDetailsProperty, playPauseButtonOptions );
    const detailsRow = createLabelledInput( detailsString, detailsButton );
    const detailsUtterance = new Utterance();

    const playingHintProperty = new BooleanProperty( false );
    const hintButton = new PlayStopButton( playingHintProperty, playPauseButtonOptions );
    const hintRow = createLabelledInput( hintString, hintButton );
    const hintUtterance = new Utterance();

    super( {
      children: [ titleText, speechRow, overviewRow, detailsRow, hintRow ],
      spacing: CONTENT_SPACING
    } );

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
        phet.joist.sim.voicingUtteranceQueue.addToBack( utterance );
      }
      else {
        webSpeaker.cancel();
      }
    };

    playingOverviewProperty.lazyLink( playingOverview => { playContent( playingOverviewProperty, overviewUtterance, alertManager.createOverviewContent() ); } );
    playingDetailsProperty.lazyLink( playingDetails => { playContent( playingDetailsProperty, detailsUtterance, alertManager.createDetailsContent() ); } );
    playingHintProperty.lazyLink( playingHint => { playContent( playingHintProperty, hintUtterance, alertManager.createHintContent() ); } );

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

joist.register( 'SelfVoicingToolbarItem', SelfVoicingToolbarItem );
export default SelfVoicingToolbarItem;
