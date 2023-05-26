import { ChangeEvent, useCallback, useMemo, useState } from "react";
import Modal from "./Modal";

type Form = {
  [field: string]: string;
};

export type FormData<T extends Form> = {
  [field in keyof T]: {
    description: string;
    optional?: boolean;
  };
};

interface FormModalProps<T extends Form> {
  isOpen: boolean;
  title: string;
  instructions?: string;
  formData: FormData<T>;
  initialFormValue?: T;
  errorMessage?: string;
  confirmButtonText?: string;
  closeOnConfirm?: boolean;
  requireChangesToSubmit?: boolean;
  handleClose: () => void | Promise<void>;
  handleConfirm: (form: T) => boolean | Promise<boolean>;
  transformOnChangeValue?: (value: string, field: string) => string;
}

export default function FormModal<T extends Form>({
  isOpen,
  title,
  instructions,
  formData,
  initialFormValue,
  errorMessage,
  confirmButtonText = "Save",
  closeOnConfirm = true,
  requireChangesToSubmit,
  handleClose: customHandleClose,
  handleConfirm: customHandleConfirm,
  transformOnChangeValue,
}: FormModalProps<T>) {
  const baseForm = useMemo(() => {
    return initialFormValue ?? getEmptyForm(formData);
  }, [initialFormValue, formData]);

  const [isValidForm, setIsValidForm] = useState<boolean>(true);
  const [formValue, setFormValue] = useState<T>(baseForm);

  const handleClose = useCallback(async () => {
    setFormValue(baseForm);
    setIsValidForm(true);
    await customHandleClose();
  }, [customHandleClose, baseForm]);

  const handleConfirm = useCallback(async () => {
    if (await customHandleConfirm(formValue)) {
      closeOnConfirm && (await handleClose());
      initialFormValue && requireChangesToSubmit && setFormValue(formValue);
    } else {
      setIsValidForm(false);
    }
  }, [
    formValue,
    customHandleConfirm,
    handleClose,
    initialFormValue,
    closeOnConfirm,
    requireChangesToSubmit,
  ]);

  const updateFormField = useCallback((field: string, value: string) => {
    setFormValue((prev) => ({ ...prev, [field]: value }));
    setIsValidForm(true);
  }, []);

  const hasChanges = useMemo(
    () =>
      Object.entries(formValue).some(([field, val]) => val !== baseForm[field]),
    [formValue, baseForm]
  );

  const isConfirmButtonDisabled =
    !isValidForm ||
    !getIsFormFilled(formValue, formData) ||
    (requireChangesToSubmit && !hasChanges);

  const modalBodyContent = useMemo(() => {
    return (
      <>
        {instructions && <div className="italic mb-4">{instructions}</div>}
        {Object.entries(formValue).map(([field, val]) => (
          <FormField
            key={field}
            field={field}
            description={formData[field].description}
            value={val}
            updateFormField={updateFormField}
            transformOnChangeValue={transformOnChangeValue}
          />
        ))}
      </>
    );
  }, [
    formData,
    formValue,
    updateFormField,
    transformOnChangeValue,
    instructions,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      errorMessage={!isValidForm ? errorMessage : undefined}
      handleClose={handleClose}
      handleConfirm={handleConfirm}
      body={modalBodyContent}
      confirmButtonText={confirmButtonText}
      isConfirmButtonDisabled={isConfirmButtonDisabled}
    />
  );
}

function getEmptyForm<T extends Form>(formData: FormData<T>): T {
  const entries = Object.keys(formData).map((field) => [field, ""]);
  return Object.fromEntries(entries);
}

function getIsFormFilled<T extends Form>(
  form: T,
  formData: FormData<T>
): boolean {
  return Object.entries(form).every(
    ([field, val]) => formData[field].optional || val
  );
}

function FormField({
  field,
  description,
  value,
  updateFormField,
  transformOnChangeValue,
}: {
  field: string;
  description: string;
  value: string;
  updateFormField: (field: string, value: string) => void;
  transformOnChangeValue?: (value: string, field: string) => string;
}): JSX.Element {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      const transformedValue = transformOnChangeValue?.(value, field) ?? value;
      updateFormField(field, transformedValue);
    },
    [field, updateFormField, transformOnChangeValue]
  );
  const inputId = `${field}-input`;

  return (
    <>
      <label htmlFor={inputId}>{description}</label>
      <input
        id={inputId}
        type="text"
        className="border border-gray-500 rounded-lg mt-2 mb-4 px-2 py-1 w-full"
        value={value}
        onChange={handleChange}
      />
    </>
  );
}
