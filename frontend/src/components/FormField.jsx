export default function FormField({ label, name, type = 'text', value, onChange, error, placeholder, required, hint }) {
  return (
    <div className="form-field">
      <label htmlFor={name}>
        {label}
        {required && ' *'}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? 'input-error' : ''}
      />
      {error && <span className="field-error">{error}</span>}
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}
