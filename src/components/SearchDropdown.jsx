import React, {useState} from 'react';
import Form from 'react-bootstrap/Form';

const SearchDropdownMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy, placeholder }, ref) => {
    const [value, setValue] = useState('');

    const placeholderLabel = placeholder || "Type to filter...";

    return (
      <div
        ref={ref}
        style={style}
        className={className}
        aria-labelledby={labeledBy}
      >
        <Form.Control
          autoFocus
          className="mx-3 my-2 w-auto"
          style={{ color: 'black' }}
          placeholder={placeholderLabel}
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child) => {
              return !value || child.props.children.toLowerCase().includes(value.toLowerCase())
            }
          )
          }
        </ul>
      </div>
    );
  },
);

export default SearchDropdownMenu;
