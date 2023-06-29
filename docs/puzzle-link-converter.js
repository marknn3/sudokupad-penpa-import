const puzzleLinkConverter = (() => {
	"use strict";	

	const reFpuzzlesUrl = /[\.\/]+f-puzzles.com\/.*\?load=([^&]+)/;
	const reSudokuPadUrl = /^sudokupad:\/\/puzzle\/(.+)/;
	const reCtc = /(app.crackingthecryptic.com\/sudoku\/|sudokupad.app\/(sudoku\/)?)(.+)/

	const loadPuzzle = {};
	
	const convertPuzzleUrl = url => {

		getPenpaDecoderOptions();

		if (PenpaDecoder.isPenpaUrl(url)) {
			let puzzle = PenpaDecoder.convertPenpaPuzzle(url);
			if (!puzzle) return null;
			let settings = Object.entries(puzzle.settings).map(([k, v]) => `setting-${k}=${v}`).join('&');
			delete puzzle.settings;
			let puzzleId = 'scl' + loadFPuzzle.compressPuzzle(PuzzleZipper.zip(JSON.stringify(puzzle))) + (settings ? '?' + settings : '');
			return puzzleId;
		}

		if (url.match(reFpuzzlesUrl)) {
			let fpuzzle = url.match(reFpuzzlesUrl);
			return 'fpuzzles' + fpuzzle[1];
		}		

		if (url.match(reSudokuPadUrl)) {
			let sudokupad = url.match(reSudokuPadUrl);
			return sudokupad[1];
		}		

		if (url.match(reCtc)) {
			let sudokupad = url.match(reCtc)
			let puzzleid = sudokupad[3].replace(/^\?puzzleid=/, '');
			return puzzleid;
		}

		return null;
	}

	function getPenpaDecoderOptions() {
		let options = document.querySelectorAll('fieldset input[type=checkbox]');
		for(let option of options) {
			PenpaDecoder.flags[option.name] = option.checked;
		}
	}

	const tinyurlUrls = [
		/tinyurl.com\/(.+)/,
		/f-puzzles.com\/\?id=(.+)/,
	]
	const tinypuzUrls = [
		/tinypuz.com\/(.+)/,
	]
	const expandShortUrl = function(url) {
		let short = tinyurlUrls.map(re => url.match(re)).find(m => m);
		if(short) {
			return new Promise((resolve, reject) => {
				//fetch('http://localhost:3000/tinyurl/' + short[1])
				fetch('https://marktekfan-api.azurewebsites.net/tinyurl/' + short[1])
				.then(res => res.text())
				.then(text => {
					console.log('json response:', text)
					let result = JSON.parse(text)
					if (result.success) {
						return resolve(result.longurl);
					}
					return resolve(url);
				})
				.catch(reject);
			});
		}
		short = tinypuzUrls.map(re => url.match(re)).find(m => m);
		if(short) {
			return new Promise((resolve, reject) => {
				//fetch('http://localhost:3000/tinyurl/' + short[1])
				fetch('https://marktekfan-api.azurewebsites.net/tinypuz/' + short[1])
				.then(res => res.text())
				.then(text => {
					console.log('json response:', text)
					let result = JSON.parse(text)
					if (result.success) {
						return resolve(result.longurl);
					}
					return resolve(url);
				})
				.catch(reject);
			});
		}
		return url;
	}

	loadPuzzle.expandShortUrl = expandShortUrl;
	loadPuzzle.convertPuzzleUrl = convertPuzzleUrl;

	return loadPuzzle;
})();
