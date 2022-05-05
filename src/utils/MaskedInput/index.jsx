import React from 'react';
import InputMask from 'react-input-mask';

export function MaskedInput({ value, onChange }){
  return (
    <InputMask
        required
        size="sm"
        className="form-control form-control-sm"
        mask="999.999.999-99"
        value={value}
        onChange={onChange}
    />
  );
}