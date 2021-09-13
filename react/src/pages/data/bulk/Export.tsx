import { Chip, Typography } from '@material-ui/core';
import { ExportImportProps } from 'components/component_interfaces';
import Button from 'components/form/Button';
import Modal from 'components/modal/Modal';
import { useEffect, useState } from 'react';

import bulkStyles from './bulk_styles';

type ImportProps<T> = ExportImportProps & {
  data: T[];
}

export default function Export<T>({ data, message, title, isOpen, handleClose }: ImportProps<T>): JSX.Element {
  const styles = bulkStyles();
  const [included, setIncluded] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [open]);

  const getTypeExportFields = (a: T): string[] => Object.keys(a);

  const add = (item: string): void => {
    const removed = excluded.splice(excluded.indexOf(item), 1)[0];
    setIncluded((old) => [...old, ...[removed]]);
  };
  const remove = (item: string): void => {
    const added = included.splice(included.indexOf(item), 1)[0];
    setExcluded((old) => [...old, ...[added]]);
  };
  const download = (): void => {
    // todo:
  };
  const uncheckAll = (): void => setExcluded([...excluded, ...included.splice(0)]);
  const reset = (): void => {
    if (data && data.length) {
      setIncluded([...getTypeExportFields(data[0])]);
    }
    setExcluded([]);
  };

  return (
    <>
      <Modal isOpen={isOpen} handleClose={handleClose} title={title}>
        <p>{message}</p>
        {
          data && data.length ?
            <>
              <Typography className={styles.header} variant='h5'>Included in export:</Typography>
              <div className={styles.exportChipRowParent}>
                {included.map((d, i) => {
                  return <Chip className={styles.chip} key={`${d}-${i}`} onDelete={remove} label={d} />;
                })}
              </div>
              <Typography className={styles.header} variant='h5'>Excluded in export:</Typography>
              <div className={styles.exportChipRowParent}>
                {excluded.map((d, i) => {
                  return <Chip className={styles.chip} key={`${d}-${i}`} onDelete={add} label={d} color='secondary' />;
                })}
              </div>
              <div className={styles.footer}>
                <div>
                  <Button disabled={included.length === 0} onClick={uncheckAll}>remove all</Button>
                  <Button disabled={excluded.length === 0} onClick={reset}>reset</Button>
                </div>
                <Button disabled={included.length <= 0} onClick={download}>download</Button>
              </div>
            </> : null
        }
      </Modal>

    </>
  );
}
