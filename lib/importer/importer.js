/**
 * Importer
 *
 * Import files specified in the import nodes.
 */
'use strict'

var defaults = require('../defaults')
var _ = require('../helper')
var Visitor = require('../visitor')
var loader = require('./fs-loader')
var parser = require('../parser')

var Importer = module.exports = function() {}

Importer.prototype = new Visitor()
Importer.prototype.constructor = Importer

Importer.prototype.import = function(ast, options, callback) {
	this.imports = options.imports || (options.imports = defaults.imports)
	this.imported = {}
	this.ast = ast
	this.callback = callback
	this.importing = 0

	try {
		this.visit(ast)
	} catch (error) {
		return callback(error)
	}

	if (!this.importing)
		callback(null, ast)
}

Importer.prototype.visitRuleset =
Importer.prototype.visitMedia =
Importer.prototype.visitVoid =
Importer.prototype.visitIf =
Importer.prototype.visitFor =
Importer.prototype.visitAssignment =
Importer.prototype.visitMixin =
Importer.prototype.visitBlock =
Importer.prototype.visitRuleList = Importer.prototype.visitNode

Importer.prototype.visitNode = _.noop

Importer.prototype.visitRoot = function(rootNode) {
	var filePath = this.filePath
	this.filePath = rootNode.filePath

	this.visit(rootNode.children)

	this.filePath = filePath
}

Importer.prototype.visitImport = function(importNode) {
	var mediaQueryListNode = importNode.children[1]
	if (mediaQueryListNode)
		return

	var urlNode = importNode.children[0]
	if (urlNode.type !== 'string' || urlNode.children.length !== 1)
		return

	var filePath = urlNode.children[0]
	if (/^\w+:\/\/|\.css$/.test(filePath))
		return

	if (!/\.roo$/.test(filePath))
		filePath += '.roo'

	filePath = _.joinPaths(_.dirname(this.filePath), filePath)

	if (this.imported[filePath])
		return null

	this.imported[filePath] = true

	var content = this.imports[filePath]
	if (typeof content === 'string') {
		var ast = parser.parse(content, {filePath: filePath})
		return this.visit(ast)
	}

	++this.importing

	var callback = this.callback

	loader.load(filePath, function(error, content) {
		if (this.hasError)
			return

		if (error) {
			this.hasError = true
			return callback(error)
		}

		try {
			this.imports[filePath] = content
			var ast = parser.parse(content, {filePath: filePath})
			this.visit(ast)
		} catch (error) {
			this.hasError = true
			return callback(error)
		}

		for (var key in ast) {
			if (ast.hasOwnProperty(key))
				importNode[key] = ast[key]
		}

		if (!--this.importing)
			callback(null, this.ast)
	}, this)
}