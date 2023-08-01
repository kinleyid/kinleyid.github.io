var jsPsych = initJsPsych({
  on_finish: function() {
    jsPsych.data.displayData();
  },
});

// ----------------------
// Randomize stimuli
// ----------------------

var words = {
  'positive': ['cheerful', 'love', 'oasis', 'prize', 'relaxation', 'bonus', 'comedy', 'courageous', 'laughter', 'lover', 'excited', 'sunshine', 'honest', 'relaxing', 'delight', 'joy', 'joyful', 'hug', 'magical', 'free', 'lovable', 'fantastic', 'christmas', 'enjoyment', 'fun', 'happy', 'happiness', 'vacation'],
  'neutral': ['altimeter', 'baggage', 'bide', 'brokerage', 'carbon', 'coarse', 'conduit', 'confuse', 'contrary', 'corral', 'daft', 'defer', 'digestion', 'esophagus', 'exclusive', 'fuselage', 'gasp', 'gauze', 'hydraulics', 'impediment', 'imperial', 'kook', 'managerial', 'mausoleum', 'median', 'memorandum', 'oblivious', 'pail', 'pee', 'pneumatic', 'precarious', 'scuttle', 'shut', 'spec', 'stopover', 'stubby', 'throes', 'torch', 'unforeseen', 'vary', 'warped', 'berth', 'blip', 'disregard', 'hardened', 'helipad', 'indisposed', 'leaded', 'lobe', 'migration', 'petrol', 'posse', 'quiver', 'ritual', 'tartar', 'transit', 'affront', 'complacent', 'consulate', 'converge', 'docket', 'limbo', 'limit', 'miter', 'mop', 'quasi', 'quiz', 'scrub', 'startled', 'stomach', 'stony', 'subtext', 'taboo', 'unnatural', 'unrelated', 'imitation', 'advisement', 'angle', 'bilge', 'blindfold', 'bucket', 'carp', 'cog', 'demure', 'femur', 'flak', 'hideout', 'impetuous', 'inanimate', 'indefinite', 'kneecap', 'mainstream', 'meeting', 'mover', 'passenger', 'percentile', 'radiator', 'recitation', 'relish', 'schlep', 'seventy', 'sidearm', 'sideline', 'sledge', 'statistic', 'talker', 'testify', 'tire', 'turret', 'unhook', 'uppercut', 'voicemail', 'wait', 'escrow', 'final', 'galley', 'lock', 'odd', 'alter', 'constitute', 'dosage', 'driveway', 'flares', 'foil', 'knot', 'lab', 'migrate', 'murmur', 'nada', 'oblique', 'pointer', 'rapid', 'splatter', 'swig', 'temporal', 'thrower', 'vector', 'absolve', 'amateur', 'beady', 'binary', 'conquering', 'dam', 'deterrent', 'dioxide', 'furlong', 'midget', 'mime', 'nonchalant', 'statesman', 'typical', 'uneventful', 'wide', 'wily', 'wipe', 'accelerant', 'debrief', 'dispatcher', 'fallopian', 'fragment', 'hock', 'mayor', 'psi', 'silo', 'triplicate', 'accomplice', 'backroom', 'birthmark', 'chop', 'clamp', 'enclosure', 'harrowing', 'hippie', 'liege', 'marginal', 'placebo', 'premed', 'pretense', 'prima', 'puzzled', 'rhetoric', 'rim', 'rove', 'sensor', 'slight', 'subtlety', 'unleash', 'upstart', 'courthouse', 'decoy', 'mashed', 'pretext', 'prune', 'analyzer', 'cement', 'crotch', 'fang', 'fullback', 'marshal', 'plunge', 'punt', 'quad', 'revision', 'ridge', 'salve', 'sink', 'sixpence', 'systematic', 'trucker', 'aka', 'bellow', 'bracket', 'breadth', 'commuter', 'corporal', 'detection', 'dial', 'facilitate', 'heel', 'jawbone', 'maneuver', 'patrolman', 'pawnshop', 'poll', 'rerun', 'retraction', 'riff', 'schematic', 'segment', 'squeaky', 'sulfate', 'temp', 'thick', 'traceable', 'unbridled', 'veer', 'weatherman', 'bequeath', 'cane', 'extremity', 'fuzz', 'intercept', 'keel', 'rating', 'repetition', 'trim', 'underlay', 'brick', 'buggy', 'claw', 'cleric', 'clerical', 'cowhand', 'curb', 'extinguish', 'fade', 'foggy', 'girth', 'hemlock', 'hemostat', 'innuendo', 'jackal', 'lure', 'medial', 'pellet', 'platoon', 'prod', 'reset', 'ruddy', 'startle', 'stopper', 'swill', 'void', 'zoning', 'axle', 'ballast', 'bulkhead', 'cervical', 'code', 'crevice', 'decathlon', 'descend', 'diaphragm', 'drawer', 'estimation', 'flush', 'fragile', 'garrison', 'impulsive', 'mimic', 'pestle', 'pithy', 'possess', 'railing', 'reentry', 'remover', 'sector', 'slugger', 'squire', 'tailpipe', 'watchtower', 'bollocks', 'border', 'byline', 'cram', 'cranny', 'creak', 'decimal', 'doornail', 'dullard', 'federation', 'foot', 'goo', 'grate', 'handbag', 'immaterial', 'interim', 'kosher', 'leave', 'letterhead', 'mere', 'oncoming', 'peculiar', 'peel', 'quadrant', 'reaction', 'rear', 'recon', 'registry', 'smash', 'standby', 'tarry', 'unexpected', 'vapor', 'verge', 'wager', 'adequate', 'bagman', 'bunker', 'cellar', 'contractor', 'cubic', 'dodger', 'duplicate', 'hind', 'homely', 'ignite', 'indigent', 'knee', 'lance', 'mallet', 'memo', 'prone', 'regroup', 'slab', 'taupe', 'thesis', 'toolbox', 'tram', 'archbishop', 'bode', 'breeder', 'cardboard', 'dwarf', 'indicative', 'manage', 'midlife', 'nomad', 'omission', 'paging', 'piggy', 'pore', 'procedural', 'roster', 'scrap', 'tank', 'veto', 'chaser', 'fielder', 'shuffle', 'strange', 'tread', 'backer', 'chamber', 'counteract', 'juju', 'molar', 'pike', 'pillbox', 'ration', 'spatial', 'stop', 'trachea', 'urchin', 'advisor', 'automated', 'babysit', 'bodily', 'brochure', 'brownstone', 'cannon', 'clarinet', 'deem', 'depict', 'emery', 'finch', 'hitchhike', 'moray', 'muffled', 'mustard', 'peptide', 'phosphate', 'pile', 'plywood', 'previous', 'prolonged', 'quarry', 'require', 'runway', 'splice', 'tally', 'thirty', 'trace', 'wedge', 'anklet', 'assign', 'baroness', 'boundary', 'clipboard', 'cluck', 'hump', 'hunting', 'infield', 'insistent', 'lease', 'lithium', 'margin', 'minority', 'ordinance', 'rake', 'reassign', 'retrace', 'ricochet', 'unused', 'airstrip', 'boss', 'briefing', 'cabbie', 'clerk', 'corridor', 'diameter', 'emissary', 'escalating', 'gauntlet', 'hanger', 'incite', 'longitude', 'mentality', 'mower', 'saline', 'skip', 'stagehand', 'standard', 'throat', 'utter', 'dawdle', 'heed', 'opposite', 'overpass', 'part', 'pulmonary', 'recall', 'report', 'saturated', 'screening', 'secondary', 'slate', 'bucko', 'divide', 'hallway', 'mackerel', 'pacifist', 'puffy', 'scaffold', 'stake', 'tilt', 'tricky', 'bumper', 'caliber', 'chain', 'crouch', 'crunch', 'divulge', 'exceed', 'genetic', 'imply', 'infer', 'label', 'liner', 'locker', 'midline', 'ongoing', 'periodic', 'pituitary', 'primal', 'pursuit', 'quadruple', 'rein', 'senior', 'snare', 'tag', 'tarp', 'tinfoil', 'uterus', 'whiff', 'wicker', 'wrapper', 'zinc', 'admiral', 'annals', 'blare', 'cadet', 'candidacy', 'choppers', 'cinder', 'cling', 'countless', 'crate', 'deliberate', 'duke', 'incur', 'leap', 'manhole', 'minimum', 'padlock', 'plate', 'ratchet', 'rawhide', 'recoil', 'republic', 'sedate', 'shovel', 'subsidiary', 'tend', 'unplug', 'unwed', 'archive', 'cab', 'conclude', 'cupboard', 'divvy', 'fairway', 'mask', 'miner', 'minor', 'nether', 'ointment', 'panel', 'penitent', 'percentage', 'plural', 'population', 'psychology', 'remind', 'rigorous', 'stone', 'tightrope', 'timer', 'workup', 'ado', 'bind', 'circuit', 'clinical', 'commodore', 'concrete', 'decimeter', 'escalation', 'feller', 'fend', 'follow', 'latitude', 'line', 'prawn', 'seller', 'take', 'wield', 'budge', 'teeming', 'cahoots', 'churn', 'combine', 'defy', 'digit', 'dossier', 'downfield', 'genetics', 'loophole', 'node', 'prenuptial', 'prospector', 'selectman', 'slant', 'slicker', 'tribune', 'turnover', 'unaffected', 'uncut', 'airlock', 'apparition', 'barmaid', 'brace', 'catalogue', 'compress', 'confess', 'contingent', 'diction', 'flashy', 'glue', 'impudence', 'jargon', 'mast', 'medium', 'mil', 'operator', 'overview', 'palpable', 'precinct', 'propulsion', 'sheath', 'six', 'spawn', 'squeeze', 'tendency', 'unknown', 'backdoor', 'cameraman', 'crease', 'defrost', 'doorknob', 'dotted', 'ergo', 'evaluation', 'flatbed', 'foreign', 'gust', 'handler', 'hormone', 'legwork', 'millimeter', 'occupy', 'ocular', 'selenium', 'sideshow', 'stat', 'stipulate', 'stockroom', 'syllabus', 'tawny', 'tomahawk', 'topple', 'carpentry', 'tracker', 'underlying', 'mouthful', 'aspect', 'average', 'bulk', 'daredevil', 'forecast', 'fryer', 'headmaster', 'minibus', 'municipal', 'newscaster', 'peddle', 'posture', 'publicity', 'quart', 'radiology', 'recount', 'repair', 'resume', 'singular', 'sitter', 'summarize', 'toothpick', 'trajectory', 'trick', 'turnpike', 'varnish', 'whelp', 'albino', 'bale', 'beeper', 'blurt', 'brake', 'canon', 'caper', 'concourse', 'crest', 'deviation', 'dispatch', 'district', 'duffel', 'envoy', 'factor', 'formality', 'grandstand', 'grouping', 'hide', 'iodine', 'leverage', 'maritime', 'mechanism', 'mixer', 'module', 'nylon', 'packer', 'potent', 'receiver', 'reckoning', 'regatta', 'reputed', 'sandman', 'seven', 'shawl', 'shorthand', 'soapbox', 'sole', 'spin', 'spokesman', 'timber', 'timetable', 'tolerable', 'topside', 'ventricle', 'applicant', 'cauldron', 'census', 'chancellor', 'crossbow', 'dispersal', 'dose', 'gap', 'humongous', 'inverted', 'officer', 'rippling', 'scrimmage', 'steamer', 'substitute', 'unturned', 'woolen', 'barrel', 'cork', 'checker', 'coil', 'log', 'occurrence', 'outreach', 'pang', 'unscrew', 'advisory', 'airspeed', 'alumnus', 'ardent', 'barley', 'barrister', 'bearer', 'bellboy', 'bin', 'blueprint', 'brink', 'changer', 'chemist', 'chromosome', 'cite', 'cloaking', 'cloakroom', 'colonial', 'copier', 'corrective', 'crimp', 'debate', 'director', 'drape', 'edit', 'empress', 'endure', 'flank', 'flyer', 'forefront', 'furlough', 'haul', 'honk', 'hub', 'institute', 'inventory', 'jockey', 'lacquer', 'layout', 'majority', 'mantis', 'manual', 'membrane', 'merge', 'metric', 'modicum', 'momentary', 'narrow', 'neurology', 'offshore', 'organ', 'pane', 'paste', 'peripheral', 'pert', 'pivot', 'plump', 'propeller', 'proxy', 'quarterly', 'ramp', 'ravenous', 'reconvene', 'regional', 'replicate', 'reprieve', 'retractor', 'revert', 'ringer', 'routine', 'scratch', 'shift', 'socialite', 'soprano', 'steel', 'steps', 'stunt', 'suggestive', 'syllable', 'tassel', 'thaw', 'tier', 'tin', 'umpteen', 'untie', 'untold', 'weld', 'winger', 'wring', 'apparent', 'guardhouse', 'news', 'placement', 'ajar', 'alias', 'allegro', 'analyst', 'antiquated', 'barometer', 'birdman', 'borough', 'brawn', 'brazen', 'broomstick', 'caving', 'chalk', 'chassis', 'clink', 'column', 'contain', 'contender', 'convene', 'convention', 'council', 'coworker', 'cubby', 'curling', 'customary', 'cutlass', 'dab', 'debutante', 'depend', 'diagnose', 'digestive', 'domino', 'edifice', 'eleven', 'embankment', 'episode', 'extension', 'flashback', 'floss', 'forty', 'franchise', 'headline', 'heady', 'hertz', 'hoist', 'honcho', 'horn', 'hose', 'husk', 'indication', 'ingest', 'invisible', 'kelp', 'knick', 'linguist', 'loosen', 'machine', 'mat', 'midair', 'multiple', 'multitude', 'nitro', 'numerical', 'orb', 'outskirts', 'platform', 'pod', 'porridge', 'psyche', 'pulley', 'rampart', 'reduction', 'rephrase', 'repose', 'retail', 'revolving', 'rotation', 'rug', 'rumble', 'seal', 'semblance', 'semester', 'shout', 'sill', 'slick', 'sophomore', 'spur', 'staple', 'stow', 'stretch', 'sub', 'telemetry', 'tempt', 'textbook', 'third', 'tile', 'ton', 'tongs', 'trademark', 'trombone', 'uncanny', 'unchanged', 'understudy', 'vent', 'vertical', 'virginal', 'vowel', 'whopping', 'widen', 'trunk', 'iron', 'scissors', 'forehead', 'anvil', 'auditory', 'autonomy', 'background', 'bag', 'bam', 'bit', 'bodega', 'boxers', 'bump', 'carpool', 'category', 'cellophane', 'chopper', 'cluster', 'collage', 'cunning', 'custodial', 'dash', 'diocese', 'dismount', 'distribute', 'dock', 'domain', 'dorsal', 'duel', 'embargo', 'euphemism', 'eventual', 'fiddle', 'fixture', 'fluid', 'footlocker', 'fore', 'forum', 'freshman', 'gazette', 'gender', 'grail', 'granite', 'graphite', 'gully', 'hangar', 'homing', 'hour', 'hydraulic', 'indicate', 'informal', 'infuser', 'interval', 'jigsaw', 'khaki', 'liaison', 'linear', 'localized', 'metal', 'monitor', 'navigate', 'network', 'nod', 'nutshell', 'ordinary', 'paramedics', 'particular', 'patented', 'pharmacy', 'pipeline', 'podium', 'post', 'premises', 'programmer', 'reposition', 'rhetorical', 'robotic', 'rope', 'roundabout', 'section', 'shipyard', 'shorten', 'slice', 'stately', 'stopwatch', 'summary', 'supervise', 'temperance', 'tracer', 'translator', 'turtleneck', 'ubiquitous', 'vacancy', 'valance', 'waiter', 'wiring', 'adjoining', 'carburetor', 'chuck', 'foregone', 'innkeeper', 'mud', 'permanent', 'scale', 'spray', 'steward', 'tooth', 'woodsman', 'zip', 'chin', 'industry', 'street', 'auctioneer', 'carve', 'compare', 'confer', 'deacon', 'decipher', 'detect', 'drift', 'eyeglasses', 'figure', 'font', 'genteel', 'hombre', 'initiation', 'knoll', 'landing', 'levee', 'magna', 'piping', 'plow', 'put', 'residual', 'review', 'sanctum', 'shin', 'sift', 'tab', 'attest', 'ballpoint', 'bang', 'behavioral', 'beluga', 'bundle', 'cabinet', 'cashier', 'chalet', 'chap', 'chaperon', 'clientele', 'clipping', 'collarbone', 'condone', 'consort', 'contract', 'crock', 'deflect', 'designated', 'evaluate', 'evident', 'faun', 'gradual', 'hardball', 'hut', 'insert', 'ion', 'jumpsuit', 'leotard', 'magnitude', 'mauve', 'meteor', 'mnemonic', 'modify', 'novice', 'onboard', 'outline', 'paraffin', 'poignant', 'protocol', 'rail', 'reduce', 'referee', 'role', 'scepter', 'session', 'standpoint', 'strap', 'surname', 'teen', 'tentative', 'usage', 'valve', 'audacious', 'brow', 'cactus', 'comparison', 'cracker', 'emulate', 'fender', 'flagpole', 'inbound', 'inner', 'jogger', 'kicker', 'metabolic', 'microphone', 'newspaper', 'patch', 'peroxide', 'range', 'raven', 'reins', 'rendition', 'sack', 'sediment', 'skijump', 'sow', 'square', 'stagecoach', 'supply', 'taillight', 'tendon', 'toner', 'tubing', 'urge', 'vein', 'widespread', 'spot', 'footing', 'inflated', 'agency', 'atoll', 'blog', 'capacity', 'cause', 'crewman', 'crumb', 'dual', 'erupt', 'floor', 'grip', 'hedge', 'innate', 'inning', 'intern', 'ironclad', 'laboratory', 'lettering', 'lid', 'locator', 'manned', 'measure', 'misty', 'oval', 'pad', 'plating', 'propriety', 'province', 'publishing', 'sorcery', 'southbound', 'spatula', 'stair', 'tray', 'valet', 'adjacent', 'alternate', 'appliance', 'arrange', 'beeswax', 'beginner', 'boarder', 'bullpen', 'claim', 'clemency', 'continuum', 'crater', 'dealership', 'delegate', 'density', 'dominant', 'earl', 'emcee', 'extract', 'gad', 'gram', 'hamper', 'hilt', 'launder', 'laundry', 'mass', 'nanometer', 'optical', 'outboard', 'packaging', 'parlay', 'piggyback', 'putty', 'react', 'trousers', 'veritable', 'admissible', 'ambiguous', 'apply', 'bid', 'binder', 'blender', 'clapper', 'dilation', 'distilled', 'dynasty', 'encounter', 'fringe', 'headband', 'impulse', 'iota', 'jingle', 'packet', 'payment', 'pedal', 'physiology', 'portion', 'pour', 'prop', 'quince', 'regulate', 'reviewer', 'roost', 'salvage', 'saucer', 'specs', 'stag', 'subsequent', 'swoop', 'ten', 'truck', 'aisle', 'banner', 'diagonal', 'dramatic', 'gauge', 'hammer', 'mores', 'scope', 'beacon', 'case', 'chest', 'colonel', 'depot', 'drizzle', 'editorial', 'feeder', 'guess', 'inform', 'internal', 'lavatory', 'massive', 'refer', 'spitfire', 'staff', 'statute', 'use', 'waver', 'westbound', 'zigzag', 'baseman', 'carrier', 'circulate', 'clasp', 'fold', 'format', 'gear', 'helmsman', 'highway', 'incidental', 'jammer', 'lark', 'neutralize', 'origin', 'outer', 'pivotal', 'polar', 'shaker', 'apache', 'audacity', 'audition', 'bio', 'birdcage', 'briefcase', 'constable', 'cortex', 'delegation', 'docking', 'echo', 'economics', 'gist', 'gloves', 'grid', 'habit', 'headway', 'houseguest', 'layer', 'macro', 'medal', 'medic', 'method', 'nationwide', 'parachute', 'prelim', 'projection', 'proportion', 'reactive', 'reverse', 'scrambled', 'seminar', 'shipshape', 'slot', 'staircase', 'teletype', 'thatch', 'yearly', 'brim', 'camper', 'cargo', 'ceramics', 'compile', 'covenant', 'fathom', 'fraction', 'halftime', 'intervene', 'jiff', 'junction', 'knob', 'length', 'makeup', 'merchant', 'mid', 'pedestrian', 'periscope', 'prominent', 'ravine', 'region', 'satchel', 'scramble', 'selective', 'shaman', 'soil', 'spacing', 'triangle', 'unquote', 'wagon', 'watcher', 'wildebeest', 'boarding', 'client', 'coachman', 'cocoon', 'copy', 'cordon', 'counter', 'estrogen', 'gymnast', 'impartial', 'middle', 'noun', 'provincial', 'recording', 'sayonara', 'seat', 'site', 'bass', 'bilateral', 'fig', 'hoopla', 'mince', 'president', 'reap', 'second', 'series', 'set', 'torso', 'tripod', 'truckload', 'turnout', 'waxed', 'bone', 'broadsword', 'coding', 'curved', 'disk', 'dispense', 'fax', 'fiver', 'grandiose', 'imprint', 'intercede', 'javelin', 'ledge', 'monolith', 'pertinent', 'physician', 'pilgrimage', 'plaster', 'prefix', 'query', 'receptacle', 'reflex', 'rotate', 'senor', 'society', 'stash', 'stripe', 'swap', 'synonymous', 'toe', 'tower', 'transcript', 'wharf', 'abstract', 'advocate', 'airplane', 'analysis', 'appear', 'armory', 'blink', 'booth', 'catapult', 'chisel', 'coating', 'crosswalk', 'dashboard', 'dye', 'emporium', 'end table', 'exception', 'flock', 'foam', 'imminent', 'innermost', 'juncture', 'mesh', 'microwave', 'mode', 'olden', 'precedent', 'reckon', 'reigning', 'rookie', 'royal', 'schilling', 'seam', 'slang', 'string', 'suitcase', 'sway', 'teaspoon', 'tipper', 'uphold', 'attach', 'auxiliary', 'bandanna', 'bathroom', 'corkscrew', 'dispenser', 'duster', 'emphasis', 'four', 'grader', 'graze', 'hatch', 'helmet', 'inspect', 'leeway', 'loop', 'metallic', 'permit', 'powder', 'processor', 'queue', 'rank', 'revise', 'shipment', 'swivel', 'titanium', 'tuna', 'ukulele', 'utilize', 'visor', 'barnacle', 'coincide', 'foot stool', 'foremost', 'main', 'motif', 'pinpoint', 'sign', 'signal', 'stick', 'sublet', 'suppose', 'surrogate', 'sweep', 'sword', 'symmetry', 'tell', 'traction', 'visitor', 'wooden', 'abode', 'barman', 'dresser', 'ground', 'hole', 'milligram', 'ascendant', 'ballot', 'bidding', 'bodyguard', 'bustle', 'camel', 'deduce', 'era', 'eyeful', 'headlight', 'husky', 'lacrosse', 'lamppost', 'layaway', 'parallel', 'partial', 'phase', 'pin', 'prep', 'roommate', 'shopper', 'spoonful', 'spout', 'strategist', 'switch', 'transfer', 'unit', 'variable', 'vendor', 'verbal', 'vibrate', 'abalone', 'algorithm', 'ascertain', 'aspirin', 'boot', 'carton', 'collegiate', 'delta', 'deputy', 'edition', 'employer', 'expedient', 'formula', 'goat', 'handbook', 'hound', 'identical', 'journalist', 'knapsack', 'moderation', 'morsel', 'motel', 'platter', 'promoter', 'refrain', 'ringside', 'shortwave', 'sponsor', 'streamline', 'tail', 'temple', 'theatrical', 'tipster', 'tissue', 'torque', 'typist', 'version', 'kerchief', 'biker', 'cirque', 'clicker', 'commence', 'compressor', 'conclusive', 'demeanor', 'earrings', 'fetch', 'flex', 'frame', 'gate', 'general', 'governor', 'hemoglobin', 'huddle', 'ladder', 'makeshift', 'mane', 'mart', 'mezzanine', 'motive', 'necessity', 'notch', 'odds', 'pomp', 'powdered', 'proverbial', 'radar', 'regimen', 'revue', 'scroll', 'side', 'sonar', 'speaker', 'statement', 'stead', 'steep', 'twelve', 'unzip', 'upholstery', 'vertebra', 'vicinity', 'await', 'bitsy', 'board', 'brooch', 'central', 'continuous', 'decree', 'department', 'doorbell', 'entice', 'famed', 'flipping', 'footage', 'header', 'hemisphere', 'lasso', 'ledger', 'lingo', 'overture', 'pant', 'pelvis', 'posterior', 'pouch', 'quantity', 'recap', 'rethink', 'seating', 'situation', 'spine', 'stack', 'subject', 'tablecloth', 'tap', 'teller', 'tidal', 'tie', 'tinkling', 'trend', 'patent', 'attempted', 'bellman', 'chart', 'concierge', 'documents', 'enigma', 'entail', 'escort', 'euro', 'exit', 'expand', 'foxhole', 'goof', 'inertia', 'mach', 'mannequin', 'mantle', 'perch', 'polymer', 'poster', 'primer', 'printing', 'roller', 'stir', 'sweeper', 'tout', 'township', 'twine', 'uncommon', 'undo', 'uplink', 'varying', 'vernacular', 'vigil', 'cassette', 'century', 'clip', 'curtain', 'firm', 'inhale', 'plankton', 'rev', 'rider', 'serve', 'shilling', 'thermal', 'toga', 'varsity', 'authorize', 'biochemist', 'bottling', 'buildup', 'cent', 'clover', 'complexity', 'conch', 'contend', 'converse', 'cranial', 'eastern', 'eight', 'external', 'formal', 'gopher', 'headset', 'insulation', 'midday', 'noir', 'onion', 'passkey', 'peek', 'persona', 'reservoir', 'residency', 'shallows', 'toughen', 'asterisk', 'bobcat', 'cavern', 'cord', 'ditty', 'elbow', 'elective', 'hunch', 'initial', 'mount', 'nightly', 'paddle', 'pantry', 'plausible', 'precedence', 'proclaim', 'recourse', 'retract', 'sheer', 'shrine', 'sip', 'sire', 'spender', 'tackle', 'validity', 'wallpaper', 'account', 'assignment', 'bidder', 'catcher', 'ceiling', 'conducive', 'keyhole', 'mention', 'mill', 'necessary', 'pursue', 'realm', 'shaver', 'usher', 'yoke', 'actuality', 'attend', 'baseline', 'biography', 'comparable', 'construct', 'discretion', 'evaporate', 'fistful', 'five', 'flare', 'gatekeeper', 'inch', 'martial', 'marzipan', 'paradox', 'plumber', 'pogo', 'projecting', 'reign', 'replica', 'sander', 'steam', 'tee', 'undeniable', 'windshield', 'consult', 'crave', 'equity', 'explain', 'flick', 'giant', 'hay', 'hill', 'other', 'paperboy', 'receipt', 'subtitle', 'supposed', 'weave', 'actress', 'amount', 'avail', 'banister', 'bisque', 'buffer', 'cattle', 'complexion', 'declare', 'detergent', 'document', 'enamel', 'equator', 'everyman', 'exacting', 'fiber', 'founding', 'fourteen', 'glossy', 'hone', 'investor', 'ironic', 'linebacker', 'man', 'paper', 'pennant', 'projector', 'putter', 'ranking', 'remote', 'rooftop', 'scooter', 'scorer', 'slope', 'subside', 'throwback', 'veil', 'absolute', 'aesthetic', 'antenna', 'bearings', 'burst', 'dissolve', 'door', 'editor', 'eighty', 'eminence', 'exposition', 'guide', 'guild', 'lateral', 'mound', 'mum', 'notary', 'overcoat', 'overdrive', 'premise', 'quail', 'register', 'represent', 'soybean', 'spar', 'storeroom', 'subscribe', 'theme', 'three', 'transition', 'verify', 'weekly', 'width', 'wriggle', 'advise', 'bridge', 'calf', 'crossover', 'curtains', 'file', 'imitate', 'knock', 'trait', 'typewriter', 'uncharted', 'approach', 'automobile', 'backdrop', 'boatload', 'clay', 'convince', 'cylinder', 'direction', 'doorman', 'drawbridge', 'editing', 'emu', 'founder', 'gentry', 'grasp', 'hallowed', 'handful', 'hulk', 'kindling', 'mechanic', 'must', 'outlet', 'parcel', 'perimeter', 'point', 'probable', 'puff', 'recite', 'retrieval', 'roadrunner', 'rye', 'seem', 'sir', 'sponge', 'stationary', 'stealth', 'tad', 'talcum', 'template', 'theatrics', 'turn', 'upscale', 'whirl', 'whittle', 'accompany', 'assembly', 'basin', 'bellhop', 'bottle', 'browse', 'brush', 'building', 'carte', 'circular', 'columnist', 'consenting', 'creamer', 'diagram', 'exert', 'foreground', 'fork', 'garter', 'hem', 'indicator', 'interlude', 'mantra', 'motorist', 'newsreel', 'oatmeal', 'rinse', 'scan', 'surfer', 'thin', 'tone', 'twig', 'welding', 'apothecary', 'button', 'cavalier', 'civilian', 'coaster', 'consume', 'counsel', 'dabble', 'immense', 'lawnmower', 'locksmith', 'moo', 'poncho', 'row', 'sash', 'sassafras', 'source', 'spade', 'specialty', 'specific', 'stairs', 'tenor', 'thermostat', 'whatnot', 'whit', 'table', 'absorb', 'adjourn', 'airspace', 'alabaster', 'ambassador', 'apparatus', 'beaker', 'belay', 'bench', 'blazer', 'blotter', 'boxcar', 'broom', 'card', 'conductor', 'courier', 'coy', 'decode', 'ditto', 'effect', 'filter', 'flagstaff', 'flicker', 'fortnight', 'garage', 'glacier', 'gobble', 'guinea', 'happen', 'hover', 'laddie', 'longtime', 'magpie', 'mascot', 'mediation', 'micro', 'minute', 'molecular', 'monsieur', 'morph', 'neutral', 'nominee', 'nose', 'occasional', 'orbital', 'password', 'pavement', 'pheromone', 'phrase', 'piccolo', 'poise', 'product', 'program', 'refuel', 'samurai', 'station', 'stock', 'system', 'tape', 'thread', 'vicar', 'zephyr'],
  'negative': ['torture', 'murder', 'chemo', 'homicide', 'terrorism', 'wreck', 'guillotine', 'gonorrhea', 'die', 'disease', 'nausea', 'disaster', 'mourning', 'virus', 'starvation', 'killer', 'kidnapper', 'massacre', 'morgue', 'nightmare', 'stress', 'unsanitary', 'kill', 'amputation', 'hijack', 'puke', 'unhappy', 'hijacker', 'cirrhosis', 'pollute', 'coma', 'death', 'insulting', 'seasick', 'worthless', 'deadly', 'hateful', 'incurable', 'mugger', 'overworked', 'parasite', 'vandalism', 'harm', 'jail', 'murderer', 'prison', 'satanic', 'bury', 'crime', 'deathly', 'debt', 'flunk', 'illness', 'killing', 'moldy', 'parasitic', 'repulsive', 'hate', 'vomit', 'alcoholism', 'attack', 'comatose', 'excrement', 'fatal', 'foreclose', 'homicidal', 'infection', 'maggot', 'mistrust', 'mutilate', 'pain', 'pollution', 'poverty', 'sabotage']
}
var k;
for (k in words) {
  words[k] = jsPsych.randomization.shuffle(words[k]);
}

// Organize by n. characters
var words_by_n_char = {}
var k, i, word, len;
var max_n_char = -Infinity;
var min_n_char = Infinity;
for (k in words) {
  words_by_n_char[k] = {};
  for (i = 0; i < words[k].length; i++) {
    word = words[k][i];
    len = word.length;
    if (words_by_n_char[k][len]) {
      words_by_n_char[k][len].push(word)
    } else {
      words_by_n_char[k][len] = [word];
    }

    if (len > max_n_char) {
      max_n_char = len;
    }
    if (len < min_n_char) {
      min_n_char = len;
    }
  }
}

var timeline_variables = [];
var valence_combos = [
  ['neutral', 'positive'],
  ['neutral', 'negative'],
  ['neutral', 'neutral']
];
var n_trials_per_type = 25;
var i, valence_combo, j, valence_i, stim;
for (i = 0; i < valence_combos.length; i++) {
  valence_combo = valence_combos[i];
  for (j = 0; j < n_trials_per_type; j++) {
    // Determine number of characters
    while (true) {
      n_char = Math.round(min_n_char + (max_n_char - min_n_char)*Math.random());
      // Must be available for both valences
      if (words_by_n_char[valence_combo[0]][n_char].length > 0) {
        if (words_by_n_char[valence_combo[1]][n_char].length > 0) {
          break;
        }
      }
    }
    stim = [];
    var curr_pushed;
    for (k = 0; k < 2; k++) {
      curr_pushed = words_by_n_char[valence_combo[k]][n_char].pop();
      if (curr_pushed == undefined) {
        console.log('here');
      }
      stim.push(curr_pushed);
    }
    timeline_variables.push({'stim': stim})
  }
}
timeline_variables = jsPsych.randomization.shuffle(timeline_variables);

// ----------------------
// Create trial objects
// ----------------------

var credit_card = {
    type: jsPsychResize,
    item_width: 3 + 3/8,
    item_height: 2 + 1/8,
    prompt: "<p>Click and drag the lower right corner of the box until the box is the same size as a credit card held up to the screen.</p>",
    pixels_per_unit: 100,
};

var stim_font = 'bold 48px Courier New';
var dot_probe_data = {}
var trial_n = 0;

var instructions = {
  type: jsPsychInstructions,
  pages: ['"z" for left, "m" for right; further instructions coming soon'],
  show_clickable_nav: true
}

var reset_data = {
  type: jsPsychCallFunction,
  func: function() {
    trial_n++;
    dot_probe_data = {
      trial_n: trial_n,
      top_stim: '',
      bottom_stim: '',
      probe_location: '',
      probe_direction: '',
      response_direction: '',
      rt: null
    }
  }
}

var fixation_cross = {
  type: jsPsychCanvasKeyboardResponse,
  trial_duration: 1000,
  choices: 'NO_KEYS',
  stimulus: function(canv) {
    // Set up canvas
    var ctx = canv.getContext('2d');
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = '150px Courier New';
    ctx.fillText(
      '+',
      1/2 * canv.width,
      1/2 * canv.height
    );
  }
}

var dot_probe_stim = {
  type: jsPsychCanvasKeyboardResponse,
  trial_duration: 100,
  choices: 'NO_KEYS',
  stimulus: function(canv) {
    // Set up canvas
    var ctx = canv.getContext('2d');
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = stim_font;

    // Get stim and determine location
    var stim = jsPsych.timelineVariable('stim');
    if (Math.random() < 0.5) {
      dot_probe_data.top_stim = stim[0];
      dot_probe_data.bottom_stim = stim[1];
    } else {
      dot_probe_data.top_stim = stim[1];
      dot_probe_data.bottom_stim = stim[0];
    }

    // Draw stim
    ctx.fillText(
      dot_probe_data.top_stim,
      1/2 * canv.width,
      1/4 * canv.height
    );
    ctx.fillText(
      dot_probe_data.bottom_stim,
      1/2 * canv.width,
      3/4 * canv.height
    );
  }
}

var dot_probe_probe = {
  type: jsPsychCanvasKeyboardResponse,
  choices: ['z', 'm'],
  stimulus: function(canv) {
    // Set up canvas
    var ctx = canv.getContext('2d');
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = stim_font;

    // Determine probe location...
    var probe_location_ppn_y, probe_location_ppn_x;
    if (Math.random() < 0.5) {
      dot_probe_data.probe_location = 'top';
      probe_location_ppn_x = 1/2 * canv.width;
      probe_location_ppn_y = 1/4 * canv.height;
    } else {
      dot_probe_data.probe_location = 'bottom';
      probe_location_ppn_x = 1/2 * canv.width;
      probe_location_ppn_y = 3/4 * canv.height;
    }

    // ...and direction
    var probe;
    if (Math.random() < 0.5) {
      dot_probe_data.probe_direction = 'left';
      probe = '<<';
    } else {
      dot_probe_data.probe_direction = 'right';
      probe = '>>';
    }

    // Draw probe
    ctx.fillText(
      probe,
      probe_location_ppn_x,
      probe_location_ppn_y
    );
  },
  on_finish: function(data) {
    if (data.response == 'z') {
      dot_probe_data.response_direction = 'left';
    } else {
      dot_probe_data.response_direction = 'right';
    }
    dot_probe_data.rt = data.rt;
  }
}

var record_data = {
  type: jsPsychCallFunction,
  func: function() {},
  on_finish: function(data) {
    var k, dp_k;
    for (k in dot_probe_data) {
      dp_k = 'dp_' + k;
      data[dp_k] = dot_probe_data[k];
    }
  }
}

var dot_probe_sequence = {
  timeline: [
    reset_data,
    fixation_cross,
    dot_probe_stim,
    dot_probe_probe,
    record_data
  ],
  timeline_variables: timeline_variables
}

// Undo the resizing---it doesn't matter for the rest of the experiment
var unresize = {
  type: jsPsychCallFunction,
  func: function() {},
  on_finish: function(data) {
    document.getElementById("jspsych-content").style.transform = "";
  }
}

var timeline = [credit_card, instructions, dot_probe_sequence, unresize];

jsPsych.run(timeline);