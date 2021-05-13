// Copyright 2013-2019, University of Colorado Boulder

/**
 * Main class that represents one simulation.
 * Provides default initialization, such as polyfills as well.
 * If the simulation has only one screen, then there is no homescreen, home icon or screen icon in the navigation bar.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Action = require( 'AXON/Action' );
  const AnimatedPanZoomListener = require( 'SCENERY/listeners/AnimatedPanZoomListener' );
  const BarrierRectangle = require( 'SCENERY_PHET/BarrierRectangle' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Brand = require( 'BRAND/Brand' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Display = require( 'SCENERY/display/Display' );
  const DotUtil = require( 'DOT/Util' );// eslint-disable-line
  const Emitter = require( 'AXON/Emitter' );
  const Heartbeat = require( 'JOIST/Heartbeat' );
  const HomeScreen = require( 'JOIST/HomeScreen' );
  const HomeScreenView = require( 'JOIST/HomeScreenView' );
  const inherit = require( 'PHET_CORE/inherit' );
  const InputFuzzer = require( 'SCENERY/input/InputFuzzer' );
  const joist = require( 'JOIST/joist' );
  const KeyboardFuzzer = require( 'SCENERY/accessibility/KeyboardFuzzer' );
  const LegendsOfLearningSupport = require( 'JOIST/thirdPartySupport/LegendsOfLearningSupport' );
  const LookAndFeel = require( 'JOIST/LookAndFeel' );
  const MemoryMonitor = require( 'JOIST/MemoryMonitor' );
  const merge = require( 'PHET_CORE/merge' );
  const NavigationBar = require( 'JOIST/NavigationBar' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberIO = require( 'TANDEM/types/NumberIO' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const packageJSON = require( 'JOIST/packageJSON' );
  const platform = require( 'PHET_CORE/platform' );
  const Profiler = require( 'JOIST/Profiler' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ScreenshotGenerator = require( 'JOIST/ScreenshotGenerator' );
  const soundManager = require( 'TAMBO/soundManager' );
  const Tandem = require( 'TANDEM/Tandem' );
  const timer = require( 'AXON/timer' );
  const updateCheck = require( 'JOIST/updateCheck' );
  const Util = require( 'SCENERY/util/Util' );


  // ifphetio
  const phetioEngine = require( 'ifphetio!PHET_IO/phetioEngine' );

  // constants
  const PROGRESS_BAR_WIDTH = 273;
  const SUPPORTS_GESTURE_A11Y = platform.android || platform.mobileSafari;

  // globals
  phet.joist.elapsedTime = 0; // in milliseconds, use this in Tween.start for replicable playbacks

  // When the simulation is going to be used to play back a recorded session, the simulation must be put into a special
  // mode in which it will only update the model + view based on the playback clock events rather than the system clock.
  // This must be set before the simulation is launched in order to ensure that no errant stepSimulation steps are called
  // before the playback events begin.  This value is overridden for playback by PhetioEngineIO.
  // @public (phet-io)
  phet.joist.playbackModeEnabledProperty = new BooleanProperty( phet.chipper.queryParameters.playbackMode );

  /**
   * Main Sim constructor
   * @param {string} name - the name of the simulation, to be displayed in the navbar and homescreen
   * @param {Screen[]} screens - the screens for the sim
   * @param {Object} [options] - see below for options
   * @constructor
   */
  function Sim( name, screens, options ) {
    const self = this;
    window.phetSplashScreenDownloadComplete();

    // playbackModeEnabledProperty cannot be changed after Sim construction has begun, hence this listener is added before
    // anything else is done, see https://github.com/phetsims/phet-io/issues/1146
    phet.joist.playbackModeEnabledProperty.lazyLink( function( playbackModeEnabled ) {
      throw new Error( 'playbackModeEnabledProperty cannot be changed after Sim construction has begun' );
    } );

    // @public Emitter that indicates sim construction completed, and that all screen models and views have been created.
    // This was added for PhET-iO but can be used by any client. This does not coincide with the end of the Sim
    // constructor (because Sim has asynchronous steps that finish after the constructor is completed)
    this.endedSimConstructionEmitter = new Emitter();

    options = merge( {

      // Sims that do not use WebGL trigger a ~ 0.5 second pause shortly after the sim starts up, so sims must opt in to
      // webgl support, see https://github.com/phetsims/scenery/issues/621
      webgl: false
    }, options );

    // Supplied query parameters override options (but default values for non-supplied query parameters do not).
    if ( QueryStringMachine.containsKey( 'webgl' ) ) {
      options.webgl = phet.chipper.queryParameters.webgl;
    }

    Util.setWebGLEnabled( options.webgl );

    // @public - Action that indicates when the sim resized.  This Action is implemented so it can be automatically played back.
    this.resizeAction = new Action( ( width, height ) => {
      assert && assert( width > 0 && height > 0, 'sim should have a nonzero area' );

      // Gracefully support bad dimensions, see https://github.com/phetsims/joist/issues/472
      if ( width === 0 || height === 0 ) {
        return;
      }
      const self = this;
      const scale = Math.min( width / HomeScreenView.LAYOUT_BOUNDS.width, height / HomeScreenView.LAYOUT_BOUNDS.height );

      // 40 px high on iPad Mobile Safari
      const navBarHeight = scale * NavigationBar.NAVIGATION_BAR_SIZE.height;
      self.navigationBar.layout( scale, width, navBarHeight );
      self.navigationBar.y = height - navBarHeight;
      self.display.setSize( new Dimension2( width, height ) );
      const screenHeight = height - self.navigationBar.height;

      // Layout each of the screens
      _.each( self.screens, function( m ) {
        m.view.layout( width, screenHeight );
      } );

      // Resize the layer with all of the dialogs, etc.
      self.topLayer.setScaleMagnitude( scale );
      self.homeScreen && self.homeScreen.view.layout( width, screenHeight );

      // Fixes problems where the div would be way off center on iOS7
      if ( platform.mobileSafari ) {
        window.scrollTo( 0, 0 );
      }

      // update our scale and bounds properties after other changes (so listeners can be fired after screens are resized)
      this.scaleProperty.value = scale;
      this.boundsProperty.value = new Bounds2( 0, 0, width, height );
      this.screenBoundsProperty.value = new Bounds2( 0, 0, width, screenHeight );

      // updated bounds for the PanZoomListener
      this.simulationRoot.setRect( 0, 0, width, height );
      if ( this.panZoomListener ) {
        this.panZoomListener.setTargetBounds( this.boundsProperty.value );
        this.panZoomListener.setPanBounds( this.boundsProperty.value );
      }
    }, {
      tandem: Tandem.GENERAL.createTandem( 'resizeAction' ),
      parameters: [
        { name: 'width', phetioType: NumberIO },
        { name: 'height', phetioType: NumberIO }
      ],
      phetioPlayback: true,
      phetioDocumentation: 'Executes when the sim is resized'
    } );

    // Sim screens normally update by implementing model.step(dt) or view.step(dt).  When that is impossible or
    // relatively awkward, it is possible to listen for a callback when a frame begins, when a frame is being processed
    // or after the frame is complete.  See https://github.com/phetsims/joist/issues/534

    // @public Emitter that indicates when a frame starts.  Listen to this Emitter if you have an action that must be
    // performed before the step begins.
    this.frameStartedEmitter = new Emitter();

    // @public Emitter that indicates when a frame ends.  Listen to this Emitter if you have an action that must be
    // performed after the step completes.
    this.frameEndedEmitter = new Emitter();

    // @public {Action} Action that steps the simulation. This Action is implemented so it can be automatically
    // played back for PhET-iO record/playback.  Listen to this Action if you have an action that happens during the
    // simulation step.
    this.stepSimulationAction = new Action( dt => {
      this.frameStartedEmitter.emit();

      // increment this before we can have an exception thrown, to see if we are missing frames
      this.frameCounter++;

      // Apply any scaling effects here before it is used.
      dt *= phet.chipper.queryParameters.speed;

      if ( this.resizePending ) {
        this.resizeToWindow();
      }

      // If fuzz parameter is used then fuzzTouch and fuzzMouse events should be fired
      const fuzzTouch = phet.chipper.queryParameters.fuzzTouch || phet.chipper.queryParameters.fuzz;
      const fuzzMouse = phet.chipper.queryParameters.fuzzMouse || phet.chipper.queryParameters.fuzz;

      // fire or synthesize input events
      if ( fuzzMouse || fuzzTouch ) {
        this.inputFuzzer.fuzzEvents(
          phet.chipper.queryParameters.fuzzRate,
          fuzzMouse,
          fuzzTouch,
          phet.chipper.queryParameters.fuzzPointers
        );
      }

      // fire or synthesize keyboard input events
      if ( phet.chipper.queryParameters.fuzzBoard ) {
        assert && assert( this.isAccessible, 'fuzzBoard can only run with accessibility enabled.' );
        this.keyboardFuzzer.fuzzBoardEvents();
      }

      // If the user is on the home screen, we won't have a Screen that we'll want to step.  This must be done after
      // fuzz mouse, because fuzzing could change the selected screen, see #130
      const screen = this.getSelectedScreen();

      // cap dt based on the current screen, see https://github.com/phetsims/joist/issues/130
      if ( screen && screen.maxDT ) {
        dt = Math.min( dt, screen.maxDT );
      }

      // TODO: we are /1000 just to *1000?  Seems wasteful and like opportunity for error. See https://github.com/phetsims/joist/issues/387
      // Store the elapsed time in milliseconds for usage by Tween clients
      phet.joist.elapsedTime = phet.joist.elapsedTime + dt * 1000;

      // timer step before model/view steps, see https://github.com/phetsims/joist/issues/401
      // Note that this is vital to support Interactive Descriptions and the utterance queue.
      timer.emit( dt );

      // If the DT is 0, we will skip the model step (see https://github.com/phetsims/joist/issues/171)
      if ( screen && screen.model.step && dt ) {
        screen.model.step( dt );
      }

      // If using the TWEEN animation library, then update all of the tweens (if any) before rendering the scene.
      // Update the tweens after the model is updated but before the view step.
      // See https://github.com/phetsims/joist/issues/401.
      //TODO https://github.com/phetsims/joist/issues/404 run TWEENs for the selected screen only
      if ( window.TWEEN ) {
        window.TWEEN.update( phet.joist.elapsedTime );
      }

      if ( this.panZoomListener ) {
        this.panZoomListener.step( dt );
      }

      // if provided, update the vibrationManager which tracks time sequences of on/off vibration
      if ( this.vibrationManager ) {
        this.vibrationManager.step( dt );
      }

      // View step is the last thing before updateDisplay(), so we can do paint updates there.
      // See https://github.com/phetsims/joist/issues/401.
      if ( screen && screen.view.step ) {
        screen.view.step( dt );
      }
      this.display.updateDisplay();

      if ( phet.chipper.queryParameters.memoryLimit ) {
        this.memoryMonitor.measure();
      }
      this.frameEndedEmitter.emit();
    }, {
      tandem: Tandem.GENERAL.createTandem( 'stepSimulationAction' ),
      parameters: [ { name: 'dt', phetioType: NumberIO } ],
      phetioHighFrequency: true,
      phetioPlayback: true
    } );

    let initialScreen = phet.chipper.queryParameters.initialScreen;
    const homeScreen = phet.chipper.queryParameters.homeScreen;

    if ( QueryStringMachine.containsKey( 'initialScreen' ) && initialScreen === 0 && homeScreen === false ) {
      throw new Error( 'cannot specify initialScreen=0 when home screen is disabled with homeScreen=false' );
    }

    // The screens to be included, and their order, may be specified via a query parameter.
    // For documentation, see the schema for phet.chipper.queryParameters.screens in initialize-globals.js.
    // Do this before setting options.showHomeScreen, since no home screen should be shown if we have 1 screen.
    if ( QueryStringMachine.containsKey( 'screens' ) ) {
      const newScreens = [];
      phet.chipper.queryParameters.screens.forEach( function( userIndex ) {
        const screenIndex = userIndex - 1; // screens query parameter is 1-based
        if ( screenIndex < 0 || screenIndex > screens.length - 1 ) {
          throw new Error( 'invalid screen index: ' + userIndex );
        }
        newScreens.push( screens[ screenIndex ] );
      } );

      // If the user specified an initial screen other than the homescreen and specified a subset of screens
      // remap the selected 1-based index from the original screens list to the filtered screens list.
      if ( initialScreen !== 0 ) {
        const index = _.indexOf( newScreens, screens[ initialScreen - 1 ] );
        assert && assert( index !== -1, 'screen not found: ' + initialScreen );
        initialScreen = index + 1;
      }
      screens = newScreens;
    }
    options = merge( {

      // whether to show the home screen, or go immediately to the screen indicated by screenIndex
      showHomeScreen: ( screens.length > 1 ) && homeScreen && ( initialScreen === 0 ),

      // index of the screen that will be selected at startup (the query parameter is 1-based)
      screenIndex: initialScreen === 0 ? 0 : initialScreen - 1,

      // credits, see AboutDialog for format
      credits: {},

      // {null|function(tandem:Tandem):Node} creates the content for the Options dialog
      createOptionsDialogContent: null,

      // a {Node} placed onto the home screen (if available)
      homeScreenWarningNode: null,

      // if true, records the scenery input events and sends them to a server that can store them
      recordInputEventLog: false,

      // when playing back a recorded scenery input event log, use the specified filename.  Please see getEventLogName for more
      inputEventLogName: undefined,

      // TODO https://github.com/phetsims/energy-skate-park-basics/issues/370
      // this function is currently (9-5-2014) specific to Energy Skate Park: Basics, which shows Save/Load buttons in
      // the PhET menu.  This interface is not very finalized and will probably be changed for future versions,
      // so don't rely on it.
      showSaveAndLoad: false,

      // Whether accessibility features are enabled or not.  Use this option to render the Parallel DOM for
      // keyboard navigation and screen reader based auditory descriptions. The "accessibility" query parameter will
      // override this flag when true, so only use this to enable.
      accessibility: false,

      // a {Node} placed into the keyboard help dialog that can be opened from the navigation bar
      keyboardHelpNode: null,

      // the default renderer for the rootNode, see #221, #184 and https://github.com/phetsims/molarity/issues/24
      rootRenderer: 'svg',

      // {vibrationManager|null} - Responsible for managing vibration feedback for a sim. Experimental, and
      // not used frequently. The vibrationManager instance is passed through options so that tappi doesn't have to
      // become a dependency for all sims yet. If this gets more use, this will likely change.
      vibrationManager: null,

      // {boolean} - Whether to allow WebGL 2x scaling when antialiasing is detected. If running out of memory on
      // things like iPad 2s (e.g. https://github.com/phetsims/scenery/issues/859), this can be turned to false to help.
      allowBackingScaleAntialiasing: true
    }, options );

    // @public - used by PhetButton and maybe elsewhere
    this.options = options;

    // override rootRenderer using query parameter, see #221 and #184
    options.rootRenderer = phet.chipper.queryParameters.rootRenderer || options.rootRenderer;

    // @public (joist-internal) - True if the home screen is showing
    this.showHomeScreenProperty = new BooleanProperty(
      options.showHomeScreen,

      // Only instrumented for sims with > 1 screen
      screens.length > 1 ? {
        tandem: Tandem.GENERAL.createTandem( 'showHomeScreenProperty' ),
        phetioFeatured: true,
        phetioDocumentation: 'Whether or not home screen is displayed. This is independent of the "current sim screen" ' +
                             'stored in the "screenIndexProperty."'
      } : {}
    );

    // @public (joist-internal) - The selected screen's index
    this.screenIndexProperty = new NumberProperty( options.screenIndex, {
      tandem: Tandem.GENERAL.createTandem( 'screenIndexProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Indicates which sim screen is selected (0-indexed). Note that the home screen does not ' +
                           'have an index. To control the home screen see "showHomeScreenProperty".',
      validValues: _.range( 0, screens.length ),
      numberType: 'Integer'
    } );

    // @public - When the sim is active, scenery processes inputs and stepSimulation(dt) runs from the system clock.
    // Set to false for when the sim will be paused.  If the sim has playbackModeEnabledProperty set to true, the
    // activeProperty will automatically be set to false so the timing and inputs can be controlled by the playback engine
    this.activeProperty = new BooleanProperty( !phet.joist.playbackModeEnabledProperty.value, {
      tandem: Tandem.GENERAL.createTandem( 'activeProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'Determines whether the entire simulation is running and processing user input. ' +
                           'Setting this property to false pauses the simulation, and prevents user interaction.'
    } );

    // @public (read-only) - property that indicates whether the browser tab containing the simulation is currently visible
    this.browserTabVisibleProperty = new BooleanProperty( true, {
      tandem: Tandem.GENERAL.createTandem( 'browserTabVisibleProperty' ),
      phetioDocumentation: 'Indicates whether the browser tab containing the simulation is currently visible',
      phetioReadOnly: true
    } );

    // set the state of the property that indicates if the browser tab is visible
    document.addEventListener( 'visibilitychange', function() {
      self.browserTabVisibleProperty.set( document.visibilityState === 'visible' );
    }, false );

    // @public (joist-internal, read-only) - How the home screen and navbar are scaled. This scale is based on the
    // HomeScreen's layout bounds to support a consistently sized nav bar and menu. If this scale was based on the
    // layout bounds of the current screen, there could be differences in the nav bar across screens.
    this.scaleProperty = new NumberProperty( 1 );

    // @public (joist-internal, read-only) {Property.<Bounds2>|null} - global bounds for the entire simulation. null
    //                                                                 before first resize
    this.boundsProperty = new Property( null );

    // @public (joist-internal, read-only) {Property.<Bounds2>|null} - global bounds for the screen-specific part
    //                                                            (excludes the navigation bar), null before first resize
    this.screenBoundsProperty = new Property( null );

    // @public (joist-internal, read-only) {Screen|null} - The current screen, or null if showing the home screen
    this.currentScreenProperty = new Property( null );

    // @public
    this.lookAndFeel = new LookAndFeel();
    assert && assert( window.phet.joist.launchCalled, 'Sim must be launched using SimLauncher, ' +
                                                      'see https://github.com/phetsims/joist/issues/142' );

    // @private
    this.destroyed = false;

    // @public {MemoryMonitor}
    this.memoryMonitor = new MemoryMonitor();

    // @public (read-only) {boolean} - if true the simulation supports accessibility features
    this.isAccessible = phet.chipper.queryParameters.accessibility || phet.chipper.queryParameters.a11y || options.accessibility;

    // public (read-only) {boolean} - if true, add support specific to accessible technology that work with touch devices.
    this.supportsGestureA11y = this.isAccessible && SUPPORTS_GESTURE_A11Y;

    // @public (joist-internal, read-only)
    this.keyboardHelpNode = options.keyboardHelpNode;

    // Set/update global flag values that enable and configure the sound library.  These can be controlled through sim
    // flags or query params.

    // @public (joist-internal, read-only) {boolean} - true if the simulation supports sound and sound is enabled
    this.supportsSound = ( packageJSON.phet.supportsSound || phet.chipper.queryParameters.supportsSound ) &&
                         ( phet.chipper.queryParameters.sound === 'enabled' ||
                           phet.chipper.queryParameters.sound === 'muted' ) &&
                         !platform.ie;

    // @public (joist-internal, read-only) {boolean} - true if the simulation supports enhanced sound, cannot support
    // enhanced without supporting sound in general
    this.supportsEnhancedSound = this.supportsSound &&
                                 ( packageJSON.phet.supportsEnhancedSound ||
                                   phet.chipper.queryParameters.supportsEnhancedSound );

    // Initialize the sound library if enabled.
    if ( this.supportsSound ) {
      soundManager.initialize( this.browserTabVisibleProperty, this.activeProperty );
    }

    // @private {null|VibrationManager} - The singleton instance of VibrationManager. Experimental and not frequently
    // used. If used more generally, reference will no longer be needed as joist will have access to vibrationManager
    // through when tappi becomes a sim lib.
    this.vibrationManager = options.vibrationManager;
    if ( this.vibrationManager ) {
      this.vibrationManager.initialize( this.browserTabVisibleProperty, this.activeProperty );
    }

    assert && assert( !window.phet.joist.sim, 'Only supports one sim at a time' );
    window.phet.joist.sim = this;

    // Make ScreenshotGenerator available globally so it can be used in preload files such as PhET-iO.
    window.phet.joist.ScreenshotGenerator = ScreenshotGenerator;

    this.name = name;                   // @public (joist-internal)
    this.version = packageJSON.version; // @public (joist-internal)
    this.credits = options.credits;     // @public (joist-internal)

    // @private - number of animation frames that have occurred
    this.frameCounter = 0;

    // @private {boolean} - Whether the window has resized since our last updateDisplay()
    this.resizePending = true;

    // @public - Make our locale available
    this.locale = phet.chipper.locale || 'en';

    // If the locale query parameter was specified, then we may be running the all.html file, so adjust the title.
    // See https://github.com/phetsims/chipper/issues/510
    if ( QueryStringMachine.containsKey( 'locale' ) ) {
      $( 'title' ).html( name );
    }

    // enables recording of Scenery's input events, request animation frames, and dt's so the sim can be played back
    if ( phet.chipper.queryParameters.recordInputEventLog ) {
      options.recordInputEventLog = true;
      options.inputEventLogName = phet.chipper.queryParameters.recordInputEventLog;
    }

    // instead of loading like normal, download a previously-recorded event sequence and play it back (unique to the browser and window size)
    if ( phet.chipper.queryParameters.playbackInputEventLog ) {
      options.playbackInputEventLog = true;
      options.inputEventLogName = phet.chipper.queryParameters.playbackInputEventLog;
    }

    // override window.open with a semi-API-compatible function, so fuzzing doesn't open new windows.
    if ( phet.chipper.queryParameters.fuzz || phet.chipper.queryParameters.fuzzMouse || phet.chipper.queryParameters.fuzzTouch || phet.chipper.queryParameters.fuzzBoard ) {
      window.open = function() {
        return {
          focus: function() {},
          blur: function() {}
        };
      };
    }

    const $body = $( 'body' );

    // prevent scrollbars
    $body.css( 'padding', '0' ).css( 'margin', '0' ).css( 'overflow', 'hidden' );

    // check to see if the sim div already exists in the DOM under the body. This is the case for https://github.com/phetsims/scenery/issues/174 (iOS offline reading list)
    if ( document.getElementById( 'sim' ) && document.getElementById( 'sim' ).parentNode === document.body ) {
      document.body.removeChild( document.getElementById( 'sim' ) );
    }

    // Prevents selection cursor issues in Safari, see https://github.com/phetsims/scenery/issues/476
    document.onselectstart = function() { return false; };

    // @public - root node for the Display
    this.rootNode = new Node( { renderer: options.rootRenderer } );

    // root for the simulation and the target for MultiListener to support magnification since the display rootNode
    // cannot be transformed - the rectangle is resized to fill the screen to capture all input
    this.simulationRoot = new Rectangle( 0, 0, 0, 0 );
    this.rootNode.addChild( this.simulationRoot );

    // @private
    this.display = new Display( self.rootNode, {

      // prevent overflow that can cause iOS bugginess, see https://github.com/phetsims/phet-io/issues/341
      allowSceneOverflow: false,

      // Indicate whether webgl is allowed to facilitate testing on non-webgl platforms, see https://github.com/phetsims/scenery/issues/289
      allowWebGL: phet.chipper.queryParameters.webgl,
      accessibility: this.isAccessible,
      isApplication: false,
      assumeFullWindow: true, // a bit faster if we can assume no coordinate translations are needed for the display.
      allowBackingScaleAntialiasing: options.allowBackingScaleAntialiasing
    } );

    // Seeding by default a random value for reproducable fuzzes if desired
    const fuzzerSeed = phet.chipper.queryParameters.randomSeed * Math.PI;

    // @private {InputFuzzer}
    this.inputFuzzer = new InputFuzzer( this.display, fuzzerSeed );

    // @private {KeyboardFuzzer}
    this.keyboardFuzzer = new KeyboardFuzzer( this.display, fuzzerSeed );

    // When the sim is inactive, make it non-interactive, see https://github.com/phetsims/scenery/issues/414
    this.activeProperty.link( function( active ) {
      self.display.interactive = active;

      // The sim must remain inactive while playbackModeEnabledProperty is true
      if ( active ) {
        assert && assert( !phet.joist.playbackModeEnabledProperty.value, 'The sim must remain inactive while playbackModeEnabledProperty is true' );
      }
    } );

    self.display.domElement.id = 'sim';
    document.body.appendChild( self.display.domElement );

    Heartbeat.start( this );

    if ( phet.chipper.queryParameters.sceneryLog ) {
      this.display.scenery.enableLogging( phet.chipper.queryParameters.sceneryLog );
    }

    if ( phet.chipper.queryParameters.sceneryStringLog ) {
      this.display.scenery.switchLogToString();
    }

    this.display.initializeEvents( {
      tandem: Tandem.GENERAL.createTandem( 'controller' ).createTandem( 'input' )
    } ); // sets up listeners on the document with preventDefault(), and forwards those events to our scene
    window.phet.joist.rootNode = this.rootNode; // make the scene available for debugging
    window.phet.joist.display = this.display; // make the display available for debugging

    // Pass through query parameters to scenery for showing supplemental information
    self.display.setPointerDisplayVisible( phet.chipper.queryParameters.showPointers );
    self.display.setPointerAreaDisplayVisible( phet.chipper.queryParameters.showPointerAreas );
    self.display.setHitAreaDisplayVisible( phet.chipper.queryParameters.showHitAreas );
    self.display.setCanvasNodeBoundsVisible( phet.chipper.queryParameters.showCanvasNodeBounds );
    self.display.setFittedBlockBoundsVisible( phet.chipper.queryParameters.showFittedBlockBounds );

    // @public
    this.screens = screens;

    // Multi-screen sims get a home screen. Note: the home screen is created even when
    // phet.chipper.queryParameters.homeScreen is false. That query parameter only affects the ability to view
    // the home screen. See NavigationBar for phet.chipper.queryParameters.homeScreen usage.
    if ( screens.length > 1 ) {
      this.homeScreen = new HomeScreen( this, Tandem.ROOT.createTandem( 'homeScreen' ), {
        warningNode: options.homeScreenWarningNode
      } );
      this.homeScreen.initializeModelAndView();
    }
    else {
      this.homeScreen = null;
    }

    // @public (joist-internal)
    this.navigationBar = new NavigationBar( this, screens, this.showHomeScreenProperty, Tandem.GENERAL.createTandem( 'navigationBar' ) );

    // @private {AnimatedPanZoomListener|null} - magnification support, null unless requested by query param
    this.panZoomListener = null;
    if ( phet.chipper.queryParameters.zoom ) {
      this.panZoomListener = new AnimatedPanZoomListener( this.simulationRoot );
      this.simulationRoot.addInputListener( this.panZoomListener );
    }

    // @public (joist-internal)
    this.updateBackground = function() {
      self.lookAndFeel.backgroundColorProperty.value = self.currentScreenProperty.value ?
                                                       self.currentScreenProperty.value.backgroundColorProperty.value :
                                                       self.homeScreen.backgroundColorProperty.value;
    };

    this.lookAndFeel.backgroundColorProperty.link( function( backgroundColor ) {
      self.display.backgroundColor = backgroundColor;
    } );

    // Set up PhET-iO, must be done after phet.joist.sim is assigned
    Tandem.PHET_IO_ENABLED && phetioEngine.initialize();

    // commented out because https://github.com/phetsims/joist/issues/553 is deferred for after GQIO-oneone
    // if ( PHET_IO_ENABLED ) {
    //   this.engagementMetrics = new EngagementMetrics( this );
    // }

    Property.multilink( [ this.showHomeScreenProperty, this.screenIndexProperty ],
      function( showHomeScreen, screenIndex ) {
        self.currentScreenProperty.value = ( showHomeScreen && self.homeScreen ) ? null : screens[ screenIndex ];
        self.updateBackground();
      } );

    // When the user switches screens, interrupt the input on the previous screen.
    // See https://github.com/phetsims/scenery/issues/218
    this.currentScreenProperty.lazyLink( function( newScreen, oldScreen ) {
      if ( oldScreen === null ) {
        self.homeScreen.view.interruptSubtreeInput();
      }
      else {
        oldScreen.view.interruptSubtreeInput();
      }
    } );

    // If the page is loaded from the back-forward cache, then reload the page to avoid bugginess,
    // see https://github.com/phetsims/joist/issues/448
    window.addEventListener( 'pageshow', function( event ) {
      if ( event.persisted ) {
        window.location.reload();
      }
    } );

    // Third party support
    phet.chipper.queryParameters.legendsOfLearning && new LegendsOfLearningSupport( this ).start();
  }

  joist.register( 'Sim', Sim );

  return inherit( Object, Sim, {

    /**
     * @param screens
     * @private
     */
    finishInit: function( screens ) {
      const self = this;

      // ModuleIndex should always be defined.  On startup screenIndex=1 to highlight the 1st screen.
      // When moving from a screen to the homescreen, the previous screen should be highlighted

      if ( this.homeScreen ) {
        this.simulationRoot.addChild( this.homeScreen.view );
      }
      _.each( screens, function( screen ) {
        screen.view.layerSplit = true;
        self.simulationRoot.addChild( screen.view );
      } );
      this.simulationRoot.addChild( this.navigationBar );

      Property.multilink( [ this.showHomeScreenProperty, this.screenIndexProperty ],
        function( showHomeScreen, screenIndex ) {
          if ( self.homeScreen ) {

            // You can't set the active property if the screen is visible, so order matters here
            if ( showHomeScreen ) {
              self.homeScreen.activeProperty.set( true );
              self.homeScreen.view.setVisible( true );
            }
            else {
              self.homeScreen.view.setVisible( false );
              self.homeScreen.activeProperty.set( false );
            }
          }

          // Make the selected screen visible and active, other screens invisible and inactive.
          // screen.isActiveProperty should change only while the screen is invisible.
          // See https://github.com/phetsims/joist/issues/418.
          for ( let i = 0; i < screens.length; i++ ) {
            const screen = screens[ i ];
            const visible = ( !showHomeScreen && screenIndex === i );
            if ( visible ) {
              screen.activeProperty.set( visible );
            }
            screen.view.setVisible( visible );
            if ( !visible ) {
              screen.activeProperty.set( visible );
            }
          }
          self.updateBackground();
        } );

      // layer for popups, dialogs, and their backgrounds and barriers
      this.topLayer = new Node();
      this.simulationRoot.addChild( this.topLayer );

      // @private list of nodes that are "modal" and hence block input with the barrierRectangle.  Used by modal dialogs
      // and the PhetMenu
      this.modalNodeStack = new ObservableArray(); // {Node} with node.hide()

      // @public (joist-internal) Semi-transparent black barrier used to block input events when a dialog (or other popup)
      // is present, and fade out the background.
      this.barrierRectangle = new BarrierRectangle(
        this.modalNodeStack, {
          fill: 'rgba(0,0,0,0.3)',
          pickable: true,
          tandem: Tandem.GENERAL.createTandem( 'barrierRectangle' ),
          phetioDocumentation: 'Semi-transparent barrier used to block input events when a dialog is shown, also fades out the background'
        } );
      this.topLayer.addChild( this.barrierRectangle );

      // Fit to the window and render the initial scene
      // Can't synchronously do this in Firefox, see https://github.com/phetsims/vegas/issues/55 and
      // https://bugzilla.mozilla.org/show_bug.cgi?id=840412.
      const resizeListener = function() {
        // Don't resize on window size changes if we are playing back input events.
        // See https://github.com/phetsims/joist/issues/37
        if ( !phet.joist.playbackModeEnabledProperty.value ) {
          self.resizePending = true;
        }
      };
      $( window ).resize( resizeListener );
      window.addEventListener( 'resize', resizeListener );
      window.addEventListener( 'orientationchange', resizeListener );
      window.visualViewport && window.visualViewport.addEventListener( 'resize', resizeListener );
      this.resizeToWindow();

      // Kick off checking for updates, if that is enabled
      updateCheck.check();

      // @public (joist-internal) - Keep track of the previous time for computing dt, and initially signify that time
      // hasn't been recorded yet.
      this.lastTime = -1;

      // @public (joist-internal)
      // Bind the animation loop so it can be called from requestAnimationFrame with the right this.
      this.boundRunAnimationLoop = this.runAnimationLoop.bind( this );
    },

    /*
     * Adds a popup in the global coordinate frame, and optionally displays a semi-transparent black input barrier behind it.
     * Use hidePopup() to remove it.
     * @param {Node} node - Should have node.hide() implemented to hide the popup (should subsequently call
     *                      sim.hidePopup()).
     * @param {boolean} isModal - Whether to display the semi-transparent black input barrier behind it.
     * @public
     */
    showPopup: function( node, isModal ) {
      assert && assert( node );
      assert && assert( !!node.hide, 'Missing node.hide() for showPopup' );
      assert && assert( !this.topLayer.hasChild( node ), 'Popup already shown' );
      if ( isModal ) {
        this.modalNodeStack.push( node );
      }
      this.topLayer.addChild( node );
    },

    /*
     * Hides a popup that was previously displayed with showPopup()
     * @param {Node} node
     * @param {boolean} isModal - Whether the previous popup was modal (or not)
     * @public
     */
    hidePopup: function( node, isModal ) {
      assert && assert( node && this.modalNodeStack.contains( node ) );
      assert && assert( this.topLayer.hasChild( node ), 'Popup was not shown' );
      if ( isModal ) {
        this.modalNodeStack.remove( node );
      }
      this.topLayer.removeChild( node );
    },

    /**
     * @public (joist-internal)
     */
    resizeToWindow: function() {
      this.resizePending = false;
      this.resize( window.innerWidth, window.innerHeight );
    },

    // @public (joist-internal, phet-io)
    resize: function( width, height ) {
      this.resizeAction.execute( width, height );
    },

    // @public (joist-internal)
    start: function() {
      const self = this;

      // In order to animate the loading progress bar, we must schedule work with setTimeout
      // This array of {function} is the work that must be completed to launch the sim.
      const workItems = [];
      const screens = this.screens;

      // Schedule instantiation of the screens
      screens.forEach( function initializeScreen( screen ) {
        workItems.push( function() {

          // Screens may share the same instance of backgroundProperty, see joist#441
          if ( !screen.backgroundColorProperty.hasListener( self.updateBackground ) ) {
            screen.backgroundColorProperty.link( self.updateBackground );
          }
          screen.initializeModel();
        } );
        workItems.push( function() {
          screen.initializeView( self.name, screens.length );
        } );
      } );

      // loop to run startup items asynchronously so the DOM can be updated to show animation on the progress bar
      var runItem = function( i ) {
        setTimeout( // eslint-disable-line bad-sim-text
          function() {
            workItems[ i ]();
            // Move the progress ahead by one so we show the full progress bar for a moment before the sim starts up

            const progress = DotUtil.linear( 0, workItems.length - 1, 0.25, 1.0, i );

            // Support iOS Reading Mode, which saves a DOM snapshot after the progressBarForeground has already been
            // removed from the document, see https://github.com/phetsims/joist/issues/389
            if ( document.getElementById( 'progressBarForeground' ) ) {

              // Grow the progress bar foreground to the right based on the progress so far.
              document.getElementById( 'progressBarForeground' ).setAttribute( 'width', ( progress * PROGRESS_BAR_WIDTH ) + '' );
            }
            if ( i + 1 < workItems.length ) {
              runItem( i + 1 );
            }
            else {
              setTimeout( function() { // eslint-disable-line bad-sim-text
                self.finishInit( screens );

                // Make sure requestAnimationFrame is defined
                Util.polyfillRequestAnimationFrame();

                // Option for profiling
                // if true, prints screen initialization time (total, model, view) to the console and displays
                // profiling information on the screen
                if ( phet.chipper.queryParameters.profiler ) {
                  Profiler.start( self );
                }

                // Notify listeners that all models and views have been constructed, and the Sim is ready to be shown.
                // Used by PhET-iO. This does not coincide with the end of the Sim constructor (because Sim has
                // asynchronous steps that finish after the constructor is completed )
                self.endedSimConstructionEmitter.emit();

                // place the requestAnimationFrame *before* rendering to assure as close to 60fps with the setTimeout fallback.
                // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
                // Launch the bound version so it can easily be swapped out for debugging.
                // Schedules animation updates and runs the first step()
                self.boundRunAnimationLoop();

                // After the application is ready to go, remove the splash screen and progress bar.  Note the splash
                // screen is removed after one step(), so the rendering is ready to go when the progress bar is hidden.
                window.phetSplashScreen.dispose();

                // Sanity check that there is no phetio object in phet brand, see https://github.com/phetsims/phet-io/issues/1229
                Brand.id === 'phet' && assert && assert( !phet.phetio, 'window.phet.phetio should not exist for phet brand' );

                // Communicate sim load (successfully) to joist/tests/test-sims.html
                if ( phet.chipper.queryParameters.postMessageOnLoad ) {
                  window.parent && window.parent.postMessage( JSON.stringify( {
                    type: 'load',
                    url: window.location.href
                  } ), '*' );
                }
              }, 25 ); // pause for a few milliseconds with the progress bar filled in before going to the home screen
            }
          },
          // The following sets the amount of delay between each work item to make it easier to see the changes to the
          // progress bar.  A total value is divided by the number of work items.  This makes it possible to see the
          // progress bar when few work items exist, such as for a single screen sim, but allows things to move
          // reasonably quickly when more work items exist, such as for a four-screen sim.
          30 / workItems.length
        );
      };
      runItem( 0 );
    },

    // Destroy a sim so that it will no longer consume any resources. Formerly used in Smorgasbord.  May not be used by
    // anything else at the moment.
    // @public (joist-internal)
    destroy: function() {
      this.destroyed = true;
      this.display.domElement.parentNode && this.display.domElement.parentNode.removeChild( this.display.domElement );
    },

    // @private - Bound to this.boundRunAnimationLoop so it can be run in window.requestAnimationFrame
    runAnimationLoop: function() {
      if ( !this.destroyed ) {
        window.requestAnimationFrame( this.boundRunAnimationLoop );
      }

      // Setting the activeProperty to false pauses the sim and also enables optional support for playback back recorded
      // events (if playbackModeEnabledProperty) is true
      if ( this.activeProperty.value ) {
        this.stepOneFrame();
      }
    },

    // @private - run a single frame including model, view and display updates
    stepOneFrame: function() {

      // Compute the elapsed time since the last frame, or guess 1/60th of a second if it is the first frame
      const time = Date.now();
      const elapsedTimeMilliseconds = ( this.lastTime === -1 ) ? ( 1000.0 / 60.0 ) : ( time - this.lastTime );
      this.lastTime = time;

      // Convert to seconds
      const dt = elapsedTimeMilliseconds / 1000.0;

      // Don't run the simulation on steps back in time (see https://github.com/phetsims/joist/issues/409)
      if ( dt > 0 ) {
        this.stepSimulation( dt );
      }
    },

    /**
     * Returns the selected screen, or null if the home screen is showing.
     * @returns {Screen|null}
     * @private
     */
    getSelectedScreen: function() {
      return this.showHomeScreenProperty.value ? null : this.screens[ this.screenIndexProperty.value ];
    },

    /**
     * Update the simulation model, view, scenery display with an elapsed time of dt.
     * @param {number} dt in seconds
     * @public (phet-io)
     */
    stepSimulation: function( dt ) {
      this.stepSimulationAction.execute( dt );
    },

    /**
     * Hide or show all accessible content related to the sim ScreenViews, and navigation bar. This content will
     * remain visible, but not be tab navigable or readable with a screen reader. This is generally useful when
     * displaying a pop up or modal dialog.
     *
     * @param {boolean} visible
     * @private
     */
    setAccessibleViewsVisible( visible ) {
      for ( let i = 0; i < this.screens.length; i++ ) {
        this.screens[ i ].view.accessibleVisible = visible;
      }

      this.navigationBar.accessibleVisible = visible;
      this.homeScreen && this.homeScreen.view.setAccessibleVisible( visible );
    },

    /**
     * Get the single utteranceQueue instance to be used by the PhET sim to make aria-live alerts.
     * @public
     */
    get utteranceQueue(){
      return this.display.utteranceQueue;
    }
  } );
} );