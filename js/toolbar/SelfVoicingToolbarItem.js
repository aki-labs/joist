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
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';

// constants
const CONTENT_SPACING = 10;

// strings
const titleString = joistStrings.toolbar.selfVoicing.title;
const speechString = joistStrings.toolbar.selfVoicing.speech;
const overviewString = joistStrings.toolbar.selfVoicing.overview;
const detailsString = joistStrings.toolbar.selfVoicing.details;
const hintString = joistStrings.toolbar.selfVoicing.hint;

class SelfVoicingToolbarItem extends VBox {

  /**
   * @param {SelfVoicingToolbarAlertManager} alertManager - generates the alert content when buttons are pressed
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

    const playingDetailsProperty = new BooleanProperty( false );
    const detailsButton = new PlayStopButton( playingDetailsProperty, playPauseButtonOptions );
    const detailsRow = createLabelledInput( detailsString, detailsButton );

    const playingHintProperty = new BooleanProperty( false );
    const hintButton = new PlayStopButton( playingHintProperty, playPauseButtonOptions );
    const hintRow = createLabelledInput( hintString, hintButton );

    super( {
      children: [ titleText, speechRow, overviewRow, detailsRow, hintRow ],
      spacing: CONTENT_SPACING
    } );
  }
}

joist.register( 'SelfVoicingToolbarItem', SelfVoicingToolbarItem );
export default SelfVoicingToolbarItem;
