import { useState } from "react";
import FormInputField from "../../../components/Shared/Form/FormInputField"
import { FormSection, FormSectionRow } from "../../../components/Shared/Form/FormSection";

interface IFormData{
    title:string;
    type:string;
    description:string;
}

const CreateContest = () =>{
    const [formData, setFormData] = useState<IFormData>({
        title:'',
        type:'',
        description:''
    })

    return(
        <div className="create_contest__page">
            <div className="create_contest">
                <header className="">CREATE CONTEST</header>
                <div className="create_form">
                    <FormSection title="General">
                        <FormSectionRow zIndex={2}>
                            <FormInputField 
                                label="Title*"
                                placeholder="eg. Titled Tuesday"
                                onChange={(value) => setFormData({ ...formData, title: value })}
                                value={formData.title}
                            />
                            <FormInputField 
                                label="Type*"
                                placeholder="Contest / Tournament"
                                onChange={(value) => setFormData({ ...formData, type: value })}
                                type="select"
                                options={['Contest', 'Tournament']}
                                value={formData.type}
                            />
                        </FormSectionRow>
                        <FormSectionRow>
                            <FormInputField 
                                label="Description"
                                placeholder="Enter your Description"
                                onChange={(value) => setFormData({ ...formData, description: value })}
                                type="textarea"
                                value={formData.description}
                            />
                        </FormSectionRow>
                    </FormSection>
                </div>
            </div>
        </div>
    )
}

export default CreateContest;