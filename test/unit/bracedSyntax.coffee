assert = require '../assert'

suite 'braced syntax'

test 'multi-line', ->
	assert.compileTo '''
		body {
			margin: 0
		}
	''', '''
		body {
			margin: 0;
		}
	'''

test 'single-line', ->
	assert.compileTo '''
		body { margin: 0 }
	''', '''
		body {
			margin: 0;
		}
	'''

test 'open brace in a different line, multi-line', ->
	assert.compileTo '''
		body
		{
			margin: 0
		}
	''', '''
		body {
			margin: 0;
		}
	'''

test 'open brace in a different line, single-line', ->
	assert.compileTo '''
		body
		{ margin: 0 }
	''', '''
		body {
			margin: 0;
		}
	'''

test '@extend and property, single-line', ->
	assert.compileTo '''
		html { margin: 0 }
		body { @extend html; padding: 0 }
	''', '''
		html,
		body {
			margin: 0;
		}

		body {
			padding: 0;
		}
	'''

test 'nested rulesets, single-line', ->
	assert.compileTo '''
		body { margin: 0; p { padding: 0 } }
	''', '''
		body {
			margin: 0;
		}
			body p {
				padding: 0;
			}
	'''

test '@import and ruleset, single-line', ->
	assert.compileTo '''
		@import url(file); body { margin: 0; }
	''', '''
		@import url(file);

		body {
			margin: 0;
		}
	'''

test 'assignment and ruleset, single-line', ->
	assert.compileTo '''
		body { $width = 960px; .container { width: $width } }
	''', '''
		body .container {
			width: 960px;
		}
	'''

test '@if and @else', ->
	assert.compileTo '''
		body {
			@if (false) {
				margin: 0
			}
			@else {
				margin: 1px
			}
		}
	''', '''
		body {
			margin: 1px;
		}
	'''

test '@if and @else, compact', ->
	assert.compileTo '''
		body {
			@if (false) {
				margin: 0
			} @else {
				margin: 1px
			}
		}
	''', '''
		body {
			margin: 1px;
		}
	'''

test '@if and @else, single-line', ->
	assert.compileTo '''
		body { @if (false) { margin: 0 } @else { margin: 1px } }
	''', '''
		body {
			margin: 1px;
		}
	'''