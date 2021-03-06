var ROW_COUNT = 4
var COL_COUNT = 4

function Numbers() {
	this.numbers = [[0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0]]
	// 历次移动的过程记录
	// TODO 利用记录的移动过程数据实现“撤销”、“重做”
	this.moves = []
	this.rowCount = ROW_COUNT
	this.colCount = COL_COUNT
}

Numbers.prototype = {

	forEach: function (callback) {
		if (typeof callback !== 'function') return
		this.numbers.forEach(function (row, rowIndex) {
			row.forEach(function (number, colIndex) {
				callback(number, rowIndex, colIndex)
			})
		})
	},

	get: function (row, col) {
		var row = this.numbers[row]
		return row ? row[col] : null
	},
	set: function (row, col, n) {
		if (row >= 0 && row < this.rowCount &&
			col >= 0 && row < this.colCount) {
			this.numbers[row][col] = n
		}
	},

	moveLeft: function () {
		return this.mergeRows('asc');
	},
	moveUp: function () {
		return this.mergeCols('asc');
	},
	moveRight: function () {
		return this.mergeRows('desc');
	},
	moveDown: function () {
		return this.mergeCols('desc');
	},

	mergeRows: function (order) {
		var move = this.currentMove = []

		for (var i = 0, len = this.rowCount; i < len; i++) {
			this.mergeRow(i, order);
		}

		if (move.length > 0) { this.moves.push(move) }
		this.currentMove = null
		return move
	},
	mergeCols: function (order) {
		var move = this.currentMove = []

		for (var i = 0, len = this.colCount; i < len; i++) {
			this.mergeCol(i, order);
		}

		if (move.length > 0) { this.moves.push(move) }
		this.currentMove = null
		return move
	},

	/*
	 * 任意 cell 值为 0，或与相邻 cell 值相等即可以合并
	 */
	canMerge: function () {
		var numbers = this.numbers
		var num
		var rowCount = this.rowCount
		var colCount = this.colCount
		for (var row = 0, len = rowCount; row < len; row++) {
			for (var col = 0; col < colCount; col++) {
				num = numbers[row][col]
				if (num === 0) {
					return true
				}
				if (row > 0) {
					if (num === numbers[row - 1][col]) {
						return true
					}
				}
				if (col > 0) {
					if (num === numbers[row][col - 1]) {
						return true
					}
				}
			}
		}
		return false
	},

	/*
	 * @param {'asc'|'desc'} order - 'asc' 从小往大; 'desc' 从大往小
	 */
	mergeRow: function (row, order) {
		var colX = this.colCount
		var col1
		var col2
		var cell

		if (order === 'asc') {
			col1 = 0;
			col2 = col1 + 1;

			while (col2 < colX) {
				cell = this.mergeCell(row, col1, row, col2);
				col1 = cell[1];
				col2 = col2 + 1;
			}
		} else {
			col1 = colX - 1;
			col2 = col1 - 1;

			while (col2 >= 0) {
				cell = this.mergeCell(row, col1, row, col2);
				col1 = cell[1];
				col2 = col2 - 1;
			}
		}
	},
	mergeCol: function (col, order) {
		var rowX = this.rowCount
		var row1
		var row2
		var cell

		if (order === 'asc') {
			row1 = 0;
			row2 = row1 + 1;

			while (row2 < rowX) {
				cell = this.mergeCell(row1, col, row2, col);
				row1 = cell[0];
				row2 = row2 + 1;
			}
		} else {
			row1 = rowX - 1;
			row2 = row1 - 1;

			while (row2 >= 0) {
				cell = this.mergeCell(row1, col, row2, col);
				row1 = cell[0];
				row2 = row2 - 1;
			}
		}
	},

	/*
	 * cell_2 => cell_1
	 * 将 cell_2(row2, col2) 的值合并到 cell_1(row1, col1)
	 * 返回在经过操作后值为 0 可以用作后续 cell 合并目标的 cell 坐标
	 * @return {[{number} row, {number} col] | null}
	 */
	mergeCell: function (row1, col1, row2, col2) {
		var num1 = this.numbers[row1][col1]
		var num2 = this.numbers[row2][col2]

		if (num1 == 0) {
			if (num2 === 0) {
				return [row1, col1]
			} else {
				// move
				this.moveCell({
					from: [row2, col2, num2],
					to: [row1, col1, 0],
					result: num2
				})
				return [row1, col1]
			}
		} else {
			if (num2 === 0) {
				return [row1, col1]
			} else {
				if (num1 === num2) {
					// merge
					this.moveCell({
						from: [row2, col2, num2],
						to: [row1, col1, num1],
						result: num1 + num2
					})
					// 检测是否相邻，不相邻时返回中间的空 cell
					var distance = row2 - row1 + col2 - col1
					if (distance > 1) {
						if (row1 === row2) {
							return [row1, col1 + 1]
						} else {
							return [row1 + 1, col1]
						}
					} else if (distance < -1) {
						if (row1 === row2) {
							return [row1, col1 - 1]
						} else {
							return [row1 - 1, col1]
						}
					} else {
						return [row2, col2]
					}
				} else {
					// 检测两个 cell 是否紧邻，不相邻时移动 cell2
					var distance = row2 - row1 + col2 - col1
					if (distance > 1) {
						// move
						if (row1 === row2) {
							// same row
							this.moveCell({
								from: [row2, col2, num2],
								to: [row1, col1 + 1, 0],
								result: num2
							})
							return [row1, col1 + 1]
						} else {
							// same col
							this.moveCell({
								from: [row2, col2, num2],
								to: [row1 + 1, col1, 0],
								result: num2
							})
							return [row1 + 1, col1]
						}
					} else if (distance < -1) {
						// move
						if (row1 === row2) {
							this.moveCell({
								from: [row2, col2, num2],
								to: [row1, col1 - 1, 0],
								result: num2
							})
							return [row1, col1 - 1]
						} else {
							this.moveCell({
								from: [row2, col2, num2],
								to: [row1 - 1, col1, 0],
								result: num2
							})
							return [row1 - 1, col1]
						}
					} else {
						return [row2, col2]
					}
				}
			}
		}
	},

	/*
	 * @param {Step} step - {from: [row2, col2, num2], to: [row1, col1, num1]}
	 */
	moveCell: function (step) {
		var from = step.from
		var to = step.to
		this.currentMove.push(step)
		this.numbers[ from[0] ][ from[1] ] = 0
		this.numbers[ to[0] ][ to[1] ] = step.result
	}
}

module.exports = Numbers