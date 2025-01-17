// Copyright 2020-2021, University of Colorado Boulder

/**
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import { Node } from '../../scenery/js/imports.js';
import joist from './joist.js';

class HomeScreenKeyboardHelpContent extends Node {

  constructor() {
    super( {
      children: [ new BasicActionsKeyboardHelpSection() ]
    } );
  }
}

joist.register( 'HomeScreenKeyboardHelpContent', HomeScreenKeyboardHelpContent );

export default HomeScreenKeyboardHelpContent;