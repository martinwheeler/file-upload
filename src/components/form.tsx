import React, { PureComponent } from "react";

class Form extends PureComponent {
  render() {
    return (
      <div>
        <form
          data-form-id="5d25d3ea72bcdb0001bb1e03"
          data-success-redirect=""
          autoComplete="on"
          method="POST"
        >
          <div className="field-list clear">
            <div
              id="email-yui_3_17_2_1_1562756774460_1224825"
              className="form-item field email required"
            >
              <label
                className="title"
                htmlFor="email-yui_3_17_2_1_1562756774460_1224825-field"
              >
                Email <span className="required">*</span>
              </label>

              <input
                className="field-element"
                id="email-yui_3_17_2_1_1562756774460_1224825-field"
                name="email"
                type="email"
                autoComplete="email"
                spellCheck="false"
              />
            </div>

            <div
              id="textarea-yui_3_17_2_1_1563355967219_25421"
              className="form-item field textarea"
            >
              <label
                className="title"
                htmlFor="textarea-yui_3_17_2_1_1563355967219_25421-field"
              >
                Upload your CV
              </label>
              <div className="description">
                FileField;MaxSize=10240;Multiple;ButtonLabel=Choose_File;RequiredField=Email;RequiredFieldMessage=Enter_your_email_before_uploading_your_files.
              </div>
              <textarea
                className="field-element "
                id="textarea-yui_3_17_2_1_1563355967219_25421-field"
                placeholder=".jpg, .jpeg, .png, .gif, .txt, .pdf, .doc, .docx"
              />
            </div>
          </div>

          <div className="form-button-wrapper form-button-wrapper--align-left">
            <input
              className="button sqs-system-button sqs-editable-button"
              type="submit"
              value="Submit"
            />
          </div>
        </form>
      </div>
    );
  }
}

export default Form;
