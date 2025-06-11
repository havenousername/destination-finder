const Button = ({handleButton, children, className = ''}) => {
    return (
      <div
        onClick={() => handleButton()}
        className={`px-4 ${className}`}
        style={{
          cursor: "pointer",
          position: "relative",
          color: "white",
          height: "2.3rem",
          minWidth: "11.5rem",
          background: "#193D4A",
          border: "1px solid #336273" ,
          borderRadius: "0.8rem",
          marginRight: "1rem"
      }}>
           {children}
      </div>
    );
}


export default Button;