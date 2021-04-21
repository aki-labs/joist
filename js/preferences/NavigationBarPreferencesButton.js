// Copyright 2021, University of Colorado Boulder

/**
 * Button in the NavigationBar that opens the PreferencesDialog.
 *
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import PDOMUtils from '../../../scenery/js/accessibility/pdom/PDOMUtils.js';
import UserCog from '../../../sherpa/js/fontawesome-5/solid/UserCog.js';
import PhetioCapsule from '../../../tandem/js/PhetioCapsule.js';
import Dialog from '../../../sun/js/Dialog.js';
import joist from '../joist.js';
import joistStrings from '../joistStrings.js';
import JoistButton from '../JoistButton.js';
import PreferencesDialog from './PreferencesDialog.js';

// constants
const preferencesTitleString = joistStrings.preferences.title;

class NavigationBarPreferencesButton extends JoistButton {

  /**
   * @param {PreferencesConfiguration} preferencesConfiguration
   * @param {PreferencesProperties} preferencesProperties
   * @param {LookAndFeel} lookAndFeel
   * @param {Property.<boolean>} simSoundProperty
   * @param tandem
   */
  constructor( preferencesConfiguration, preferencesProperties, lookAndFeel, simSoundProperty, tandem ) {

    const icon = new UserCog( {
      fill: lookAndFeel.navigationBarTextFillProperty,
      maxWidth: 25
    } );

    const preferencesDialogCapsule = new PhetioCapsule( tandem => {
      return new PreferencesDialog( preferencesConfiguration, preferencesProperties, simSoundProperty, {
        tandem: tandem
      } );
    }, [], {
      tandem: tandem.createTandem( 'preferencesDialogCapsule' ),
      phetioType: PhetioCapsule.PhetioCapsuleIO( Dialog.DialogIO )
    } );
    super( icon, lookAndFeel.navigationBarFillProperty, tandem, {
      listener: () => {
        const dialog = preferencesDialogCapsule.getElement();
        dialog.show();
        PDOMUtils.getNextFocusable().focus();
      },
      highlightExtensionWidth: 5,
      highlightExtensionHeight: 10,

      // pdom
      innerContent: joistStrings.preferences.title
    } );

    // voicing
    this.voicingCreateObjectResponse = event => {
      if ( event.type === 'focus' ) {
        return preferencesTitleString;
      }
    };
  }
}

joist.register( 'NavigationBarPreferencesButton', NavigationBarPreferencesButton );
export default NavigationBarPreferencesButton;