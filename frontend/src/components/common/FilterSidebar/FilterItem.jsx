import React from "react";
import { Checkbox, Radio, Slider, Input } from "antd";

const FilterItem = ({
  type,
  options = [],
  value,
  onChange,
  min,
  max,
  step,
  placeholder,
}) => {
  switch (type) {
    case "checkbox":
      return (
        <Checkbox.Group options={options} value={value} onChange={onChange} />
      );

    case "radio":
      return (
        <Radio.Group
          onChange={(e) => onChange(e.target.value)}
          value={value}
          className="filter-radio-group"
        >
          {options.map((opt) => (
            <Radio key={opt.value || opt} value={opt.value || opt}>
              {opt.label || opt}
            </Radio>
          ))}
        </Radio.Group>
      );

    case "slider":
      return (
        <>
          <Slider
            range
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            tooltip={{ formatter: (v) => `${v.toLocaleString()}đ` }}
          />
          <p className="price-range">
            {value[0].toLocaleString()}đ - {value[1].toLocaleString()}đ
          </p>
        </>
      );

    case "input":
      return (
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    default:
      return null;
  }
};

export default FilterItem;
