/*
 * BSTable
 * @description  Javascript (JQuery) library to make bootstrap tables editable. Inspired by Tito Hinostroza's library Bootstable. BSTable Copyright (C) 2020 Thomas Rokicki
 * 
 * @version 1.0
 * @author Thomas Rokicki (CraftingGamerTom), Tito Hinostroza (t-edson)
 */
"use strict";
/** @class BSTable class that represents an editable bootstrap table. */

function _newArrowCheck(innerThis, boundThis) { if (innerThis !== boundThis) { throw new TypeError("Cannot instantiate an arrow function"); } }

var BSTable = /*#__PURE__*/function () {
  /**
   * Creates an instance of BSTable.
   *
   * @constructor
   * @author: Thomas Rokicki (CraftingGamerTom)
   * @param {tableId} tableId The id of the table to make editable.
   * @param {options} options The desired options for the editable table.
   */
  function BSTable(tableId, options) {
    var defaults = {
      editableColumns: null,
      // Index to editable columns. If null all td will be editable. Ex.: "1,2,3,4,5"
      $addButton: null,
      // Jquery object of "Add" button
      onEdit: function onEdit() {},
      // Called after editing (accept button clicked)
      onBeforeDelete: function onBeforeDelete() {},
      // Called before deletion
      onDelete: function onDelete() {},
      // Called after deletion
      onAdd: function onAdd() {},
      // Called when added a new row
      advanced: {
        // Do not override advanced unless you know what youre doing
        columnLabel: 'Actions',
        confirmQuestion: 'Are you sure to delete this row?',
        buttonHTML: "<div class=\"btn-group pull-right\">\n                <button id=\"bEdit\" type=\"button\" class=\"btn btn-sm btn-default\">\n                    <span class=\"fa fa-edit\" > </span>\n                </button>\n                <button id=\"bDel\" type=\"button\" class=\"btn btn-sm btn-default\">\n                    <span class=\"fa fa-trash\" > </span>\n                </button>\n                <button id=\"bAcep\" type=\"button\" class=\"btn btn-sm btn-default\" style=\"display:none;\">\n                    <span class=\"fa fa-check-circle\" > </span>\n                </button>\n                <button id=\"bCanc\" type=\"button\" class=\"btn btn-sm btn-default\" style=\"display:none;\">\n                    <span class=\"fa fa-times-circle\" > </span>\n                </button>\n            </div>"
      }
    };
    this.table = $('#' + tableId);
    this.options = $.extend(true, defaults, options);
    /** @private */

    this.actionsColumnHTML = '<td name="bstable-actions">' + this.options.advanced.buttonHTML + '</td>'; //Process "editableColumns" parameter. Sets the columns that will be editable

    if (this.options.editableColumns != null) {
      // console.log("[DEBUG] editable columns: ", this.options.editableColumns);
      //Extract felds
      this.options.editableColumns = this.options.editableColumns.split(',');
    }
  } // --------------------------------------------------
  // -- Public Functions
  // --------------------------------------------------

  /**
   * Initializes the editable table. Creates the actions column.
   * @since 1.0.0
   */


  var _proto = BSTable.prototype;

  _proto.init = function init() {
    this.table.find('thead tr').append('<th name="bstable-actions">' + this.options.advanced.columnLabel + '</th>'); // Append column to header

    this.table.find('tbody tr').append(this.actionsColumnHTML);

    this._addOnClickEventsToActions(this.options.advanced.confirmQuestion); // Add onclick events to each action button in all rows
    // Process "addButton" parameter


    if (this.options.$addButton != null) {
      var _this = this; // Add a managed onclick event to the button


      this.options.$addButton.click(function () {
        _this._actionAddRow();
      });
    }
  }
  /**
   * Destroys the editable table. Removes the actions column.
   * @since 1.0.0
   */
  ;

  _proto.destroy = function destroy() {
    this.table.find('th[name="bstable-actions"]').remove(); //remove header

    this.table.find('td[name="bstable-actions"]').remove(); //remove body rows
  }
  /**
   * Refreshes the editable table. 
   *
   * Literally just removes and initializes the editable table again, wrapped in one function.
   * @since 1.0.0
   */
  ;

  _proto.refresh = function refresh() {
    this.destroy();
    this.init();
  } // --------------------------------------------------
  // -- 'Static' Functions
  // --------------------------------------------------

  /**
   * Returns whether the provided row is currently being edited.
   *
   * @param {Object} row
   * @return {boolean} true if row is currently being edited.
   * @since 1.0.0
   */
  ;

  _proto.currentlyEditingRow = function currentlyEditingRow($currentRow) {
    // Check if the row is currently being edited
    if ($currentRow.attr('data-status') == 'editing') {
      return true;
    } else {
      return false;
    }
  } // --------------------------------------------------
  // -- Button Mode Functions
  // --------------------------------------------------
  ;

  _proto._actionsModeNormal = function _actionsModeNormal(button) {
    $(button).parent().find('#bAcep').hide();
    $(button).parent().find('#bCanc').hide();
    $(button).parent().find('#bEdit').show();
    $(button).parent().find('#bDel').show();
    var $currentRow = $(button).parents('tr'); // get the row

    $currentRow.attr('data-status', ''); // remove editing status
  };

  _proto._actionsModeEdit = function _actionsModeEdit(button) {
    $(button).parent().find('#bAcep').show();
    $(button).parent().find('#bCanc').show();
    $(button).parent().find('#bEdit').hide();
    $(button).parent().find('#bDel').hide();
    var $currentRow = $(button).parents('tr'); // get the row

    $currentRow.attr('data-status', 'editing'); // indicate the editing status
  } // --------------------------------------------------
  // -- Private Event Functions
  // --------------------------------------------------
  ;

  _proto._rowEdit = function _rowEdit(button) {
    // Indicate user is editing the row
    var $currentRow = $(button).parents('tr'); // access the row

    console.log($currentRow);
    var $cols = $currentRow.find('td'); // read rows

    console.log($cols);
    if (this.currentlyEditingRow($currentRow)) return; // not currently editing, return
    //Pone en modo de edición

    this._modifyEachColumn(this.options.editableColumns, $cols, function ($td) {
      // modify each column
      var content = $td.html(); // read content

      console.log(content);
      var div = '<div style="display: none;">' + content + '</div>'; // hide content (save for later use)

      var input = '<input class="form-control input-sm"  data-original-value="' + content + '" value="' + content + '">';
      $td.html(div + input); // set content
    });

    this._actionsModeEdit(button);
  };

  _proto._rowDelete = function _rowDelete(button, confirmMessage) {
    var _this2 = this;

    // Remove the row
    var $currentRow = $(button).parents('tr'); // access the row

    var $cols = $currentRow.find('td'); // read rows

    var colValues = '';
    $cols.each(function (i, c) {
      _newArrowCheck(this, _this2);

      if (c.innerText != '') {
        colValues += c.innerText + (i < $cols.length - 2 ? ', ' : '');
      }
    }.bind(this));

    if (!confirm(colValues + '\n\n' + confirmMessage)) {
      return false;
    }

    this.options.onBeforeDelete($currentRow);
    $currentRow.remove();
    this.options.onDelete();
  };

  _proto._rowAccept = function _rowAccept(button) {
    // Accept the changes to the row
    var $currentRow = $(button).parents('tr'); // access the row

    console.log($currentRow);
    var $cols = $currentRow.find('td'); // read fields

    if (!this.currentlyEditingRow($currentRow)) return; // not currently editing, return
    // Finish editing the row & save edits

    this._modifyEachColumn(this.options.editableColumns, $cols, function ($td) {
      // modify each column
      var cont = $td.find('input').val(); // read through each input

      $td.html(cont); // set the content and remove the input fields
    });

    this._actionsModeNormal(button);

    this.options.onEdit($currentRow[0]);
  };

  _proto._rowCancel = function _rowCancel(button) {
    // Reject the changes
    var $currentRow = $(button).parents('tr'); // access the row

    var $cols = $currentRow.find('td'); // read fields

    if (!this.currentlyEditingRow($currentRow)) return; // not currently editing, return
    // Finish editing the row & delete changes

    this._modifyEachColumn(this.options.editableColumns, $cols, function ($td) {
      // modify each column
      var cont = $td.find('div').html(); // read div content

      $td.html(cont); // set the content and remove the input fields
    });

    this._actionsModeNormal(button);
  };

  _proto._actionAddRow = function _actionAddRow() {
    // Add row to this table
    var $allRows = this.table.find('tbody tr');

    if ($allRows.length == 0) {
      // there are no rows. we must create them
      var $currentRow = this.table.find('thead tr'); // find header

      var $cols = $currentRow.find('th'); // read each header field
      // create the new row

      var newColumnHTML = '';
      $cols.each(function () {
        var column = this; // Inner function this (column object)

        if ($(column).attr('name') == 'bstable-actions') {
          newColumnHTML = newColumnHTML + actionsColumnHTML; // add action buttons
        } else {
          newColumnHTML = newColumnHTML + '<td></td>';
        }
      });
      this.table.find('tbody').append('<tr>' + newColumnHTML + '</tr>');
    } else {
      // there are rows in the table. We will clone the last row
      var $lastRow = this.table.find('tr:last');
      $lastRow.clone().appendTo($lastRow.parent());
      $lastRow = this.table.find('tr:last');

      var _$cols = $lastRow.find('td'); //lee campos


      _$cols.each(function () {
        var column = this; // Inner function this (column object)

        if ($(column).attr('name') == 'bstable-actions') {// action buttons column. change nothing
        } else {
          $(column).html(''); // clear the text
        }
      });
    }

    this._addOnClickEventsToActions(this.options.advanced.confirmQuestion); // Add onclick events to each action button in all rows


    this.options.onAdd();
  } // --------------------------------------------------
  // -- Helper Functions
  // --------------------------------------------------
  ;

  _proto._modifyEachColumn = function _modifyEachColumn($editableColumns, $cols, howToModify) {
    // Go through each editable field and perform the howToModifyFunction function
    var n = 0;
    $cols.each(function () {
      n++;
      if ($(this).attr('name') == 'bstable-actions') return; // exclude the actions column

      if (!isEditableColumn(n - 1)) return; // Check if the column is editable

      howToModify($(this)); // If editable, call the provided function
    }); // console.log("Number of modified columns: " + n); // debug log

    function isEditableColumn(columnIndex) {
      // Indicates if the column is editable, based on configuration
      if ($editableColumns == null) {
        // option not defined
        return true; // all columns are editable
      } else {
        // option is defined
        //console.log('isEditableColumn: ' + columnIndex);  // DEBUG
        for (var i = 0; i < $editableColumns.length; i++) {
          if (columnIndex == $editableColumns[i]) return true;
        }

        return false; // column not found
      }
    }
  };

  _proto._addOnClickEventsToActions = function _addOnClickEventsToActions(q) {
    var _this = this; // Add onclick events to each action button


    this.table.find('tbody tr #bEdit').each(function () {
      var button = this;

      button.onclick = function () {
        _this._rowEdit(button);
      };
    });
    this.table.find('tbody tr #bDel').each(function () {
      var button = this;

      button.onclick = function () {
        _this._rowDelete(button, q);
      };
    });
    this.table.find('tbody tr #bAcep').each(function () {
      var button = this;

      button.onclick = function () {
        _this._rowAccept(button);
      };
    });
    this.table.find('tbody tr #bCanc').each(function () {
      var button = this;

      button.onclick = function () {
        _this._rowCancel(button);
      };
    });
  } // --------------------------------------------------
  // -- Conversion Functions
  // --------------------------------------------------
  ;

  _proto.convertTableToCSV = function convertTableToCSV(separator) {
    // Convert table to CSV
    var _this = this;

    var $currentRowValues = '';
    var tableValues = '';

    _this.table.find('tbody tr').each(function () {
      // force edits to complete if in progress
      if (_this.currentlyEditingRow($(this))) {
        $(this).find('#bAcep').click(); // Force Accept Edit
      }

      var $cols = $(this).find('td'); // read columns

      $currentRowValues = '';
      $cols.each(function () {
        if ($(this).attr('name') == 'bstable-actions') {// buttons column - do nothing
        } else {
          $currentRowValues = $currentRowValues + $(this).html() + separator;
        }
      });

      if ($currentRowValues != '') {
        $currentRowValues = $currentRowValues.substr(0, $currentRowValues.length - separator.length);
      }

      tableValues = tableValues + $currentRowValues + '\n';
    });

    return tableValues;
  };

  return BSTable;
}();
