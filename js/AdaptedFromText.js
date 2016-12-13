// Copyright 2015, University of Colorado Boulder

/**
 * Some simulations that are minor modifications of PhET Simulations can be branded as "adapted from PhET"
 * See https://github.com/phetsims/brand/
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var joist = require( 'JOIST/joist' );

  // strings
  var adaptedFromString = require( 'string!JOIST/adaptedFrom' );

  // constants
  //TODO address Firefox font problem, see https://github.com/phetsims/joist/issues/245
  var FONT = new PhetFont( {
    family: 'Arial',
    size: 8,
    weight: 'bold'
  } );

  /**
   * @param {Property.<Color|string>} fillProperty
   * @param {Object} options
   * @constructor
   */
  function AdaptedFromText( fillProperty, options ) {

    options = _.extend( {
      font: FONT
    }, options );

    Text.call( this, adaptedFromString, options );

    // Synchronize the text fill with the given fill property
    fillProperty.linkAttribute( this, 'fill' );
  }

  joist.register( 'AdaptedFromText', AdaptedFromText );

  return inherit( Text, AdaptedFromText );
} );