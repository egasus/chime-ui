import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  ListItemText,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";

const muiStyles = {
  checkBox: {
    color: "grey",
    paddingLeft: 0,
  },
  listItemPrimaryText: { color: "black" },
};

function MultiSelect({
  items,
  currentValues,
  handleChange: handleChangeFunc,
  classes,
}) {
  const [values, setValues] = useState([]);

  useEffect(() => {
    setValues(currentValues.filter((item) => items.includes(item)));
  }, [currentValues, items]);

  const handleChange = useCallback((e) => {
    e.preventDefault();
    const { value } = e.target;
    setValues(value);
    handleChangeFunc(value);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <FormControl fullWidth>
      <Select
        multiple
        displayEmpty
        fullWidth
        value={values}
        inputProps={{
          name: "multi-select",
          id: "filter__multi-select",
        }}
        renderValue={(selected) => `${selected.length} participants selected`}
        onChange={handleChange}
      >
        {items.map((item) => (
          <MenuItem key={item} value={item}>
            <Checkbox
              checked={values.indexOf(item) > -1}
              className={classes.checkBox}
            />
            <ListItemText
              primary={item}
              classes={{ primary: classes.listItemPrimaryText }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

MultiSelect.propTypes = {
  items: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  currentValues: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
  handleChange: PropTypes.func.isRequired,
  classes: PropTypes.shape({}).isRequired,
};

export default withStyles(muiStyles)(MultiSelect);
