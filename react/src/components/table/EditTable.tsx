import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { Button, Icon } from 'components/common';
import { PlainTableProps } from 'components/table/table_interfaces';
import TableContainer from './TableContainer';
import './table.scss';

export type EditTableRowAction = 'add' | 'delete' | 'duplicate' | 'edit' | 'reset';

export type EditTableVisibilityProps = {
  hideAll?: boolean;
  hideAdd?: boolean;
  hideDuplicate?: boolean;
  hideDelete?: boolean;
  hideEdit?: boolean;
  hideSave?: boolean;
  showReset?: boolean;
};

type EditTableProps<T> = Omit<PlainTableProps<T>, 'headers'> & EditTableVisibilityProps & {
  canSave: boolean;
  columns: ((d: T) => JSX.Element)[];
  data: T[];
  headers: string[];
  onRowModified: (n: T, action: EditTableRowAction) => void;
  onSave: () => void;
  saveButtonText?: string;
};

/**
 * @param columns - array of functions that return a component (rendered before the editing buttons)
 * @param canSave - is the save button enabled
 * @param data - the table data - when @param columns are rendered, the data row at the current row index is passed
 * to the column renderer function as a prop
 * @param onRowModified - call parent handler with the row clicked and @type {EditTableRowAction}
 * @param onSave - calls parent handler when save button clicked
 */
export default function EditTable<T>(props: EditTableProps<T>): JSX.Element {
  const {
    canSave,
    headers,
    hideSave,
    data,
    onRowModified,
    onSave,
    columns,
    hideAdd,
    hideAll,
    hideDuplicate,
    hideDelete,
    hideEdit,
    showReset,
    saveButtonText
  } = props;

  return <>
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((h, idx) => (
              <TableCell align='center' key={`head-${idx}`}>
                <strong>{h}</strong>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((u, idx) => {
            const rowkey = `body-${idx}`;
            const ComponentsFromProps = columns.map((cb, idx) => (
              <TableCell key={`custom-${idx}`}>{cb(u)}</TableCell>
            ));

            return hideAll ? (
              <TableRow key={rowkey}>{ComponentsFromProps}</TableRow>
            ) : (
              <TableRow key={rowkey}>
                {ComponentsFromProps}

                {/* edit button */}
                {hideEdit ? null : (
                  <TableCell>
                    <IconButton onClick={(): void => onRowModified(u, 'edit')} size="large">
                      <Icon icon='edit' />
                    </IconButton>
                  </TableCell>
                )}
                {/* delete button */}
                {hideDelete ? null : (
                  <TableCell>
                    <IconButton onClick={(): void => onRowModified(u, 'delete')} size="large">
                      <Icon icon='close' htmlColor='#8B0000' />
                    </IconButton>
                  </TableCell>
                )}
                {/* duplicate button */}
                {hideDuplicate ? null : (
                  <TableCell>
                    <IconButton onClick={(): void => onRowModified(u, 'duplicate')} size="large">
                      <Icon icon='copy' />
                    </IconButton>
                  </TableCell>
                )}
                {/* reset button (not visible by default) */}
                {showReset ? (
                  <TableCell>
                    <IconButton onClick={(): void => onRowModified(u, 'reset')} size="large">
                      <Icon icon='reset' />
                    </IconButton>
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
    {hideAll ? null : (
      <div>
        {hideAdd ? null : (
          <span>
            <Button onClick={(): void => onRowModified({} as T, 'add')} variant='outlined'>
              Add Row
            </Button>
          &nbsp; &nbsp;
          </span>
        )}
        {hideSave ? null : (
          <Box mt={1} mb={2}>
            <Button disabled={!canSave} onClick={onSave}>
              {saveButtonText ?? 'Save'}
            </Button>
          </Box>
        )}
      </div>
    )}
  </>;
}
