import { useState } from "react";
import FormInputField from "../../../components/Shared/Form/FormInputField"
import { FormSection, FormSectionRow } from "../../../components/Shared/Form/FormSection";
import { FormButton, FormButtons } from "../../../components/Shared/Form/FormButtons";
import { postAction } from "../../../services/generalServices";

interface IFormData{
    title:string;
    type:string;
    description:string;
    startDate:Date;
    registrationDeadline:Date;
    duration:number;
    tags:string[];
    questions_tags:string[];
    visibility:string;
    rules:string;
    rounds:string;
    languages:string[];
    limit?:number;
    host:{
        name:string;
        meta:{
            logo:string;
            website:string;
        }
    }
}

const CreateContest = () =>{
    const initialFormData = {
        title:'',
        type:null,
        description:'',
        startDate:null,
        registrationDeadline:null,
        duration:null,
        tags:[],
        questions_tags:[],
        visibility:'',
        rules:'',
        rounds:'',
        languages:[],
        limit:null,
        host:{
            name:'',
            meta:{
                logo:'',
                website:''
            }
        }
    };

    const [formData, setFormData] = useState<IFormData>(initialFormData);
    const [loading, setLoading] = useState<boolean>(false);

    const submitForm = async() =>{
        try{
            const res = await postAction('/events/contest/create',formData);
        }catch(err){
            console.error(err)
        }
    }

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
                                type="dropdown"
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
                    <FormSection title="Schedule">
                        <FormSectionRow>
                            <FormInputField
                                label="Registration Deadline"
                                type="datetime"
                                placeholder=""
                                value={formData.registrationDeadline}
                                onChange={(value) => setFormData({ ...formData, registrationDeadline: value })}
                            />
                            <FormInputField
                                label="Start Date & Time"
                                type="datetime"
                                placeholder=""
                                value={formData.startDate}
                                onChange={(value) => setFormData({ ...formData, startDate: value })}
                            />
                        </FormSectionRow>
                    </FormSection>
                    <FormSection title="Rules & Visibility">
                        <FormSectionRow>
                            <FormInputField 
                                label="Visiblity*"
                                placeholder="Public/Private"
                                onChange={(value) => setFormData({ ...formData, visibility: value })}
                                type="dropdown"
                                options={['Public', 'Private']}
                                value={formData.visibility}
                                zIndex={2}
                            />
                        </FormSectionRow>
                        <FormSectionRow>
                            <FormInputField 
                                label="Rules"
                                placeholder="Enter Rules"
                                onChange={(value) => setFormData({ ...formData, rules: value })}
                                type="textarea"
                                value={formData.rules}
                            />
                        </FormSectionRow>
                    </FormSection>
                    <FormSection title="Rounds & Questions">
                        <FormSectionRow>
                            <FormInputField
                                label="Rounds*"
                                subLabel="Default - 3"
                                type="number"
                                placeholder="eg. 5"
                                value={formData.rounds}
                                onChange={(value) => setFormData({ ...formData, rounds: value })}
                            />
                            <FormInputField
                                label="Duration"
                                type="number"
                                placeholder="Enter in minutes"
                                value={formData.duration}
                                onChange={(value) => {
                                    setFormData({ ...formData, duration: value })
                                }}
                                subLabel={formData.type === 'Contest' ? 'Total Duration (In Minutes)' : formData.type === 'Tournament' ? 'Per Round (In Minutes)':''}
                            />
                        </FormSectionRow>
                        <FormSectionRow zIndex={2}>
                            <FormInputField 
                                label="Languages Allowed"
                                placeholder="Select Languages"
                                onChange={(updatedTags) => setFormData({ ...formData, languages : updatedTags })}
                                type="multi-dropdown"
                                options={["Python", "JavaScript", "CPP","Python1", "JavaScript1", "CPP1"]}
                                value={formData.languages}
                            />
                            <FormInputField 
                                label="Max Participants"
                                subLabel="Default - 100"
                                placeholder="eg. 100"
                                onChange={(value) => setFormData({ ...formData, limit: value })}
                                type="number"
                                value={formData.limit}
                            />
                        </FormSectionRow>
                        <FormSectionRow>
                            <FormInputField 
                                label="General Tags"
                                placeholder="Select Tags"
                                onChange={(updatedTags) => setFormData({ ...formData, tags: updatedTags })}
                                type="multi-dropdown"
                                options={['Competitive-Programming','1V1']}
                                value={formData.tags}
                            />
                            <FormInputField 
                                label="Questions Tags"
                                placeholder="Select Tags"
                                onChange={(updatedTags) => setFormData({ ...formData, questions_tags: updatedTags })}
                                type="multi-dropdown"
                                options={['Algorithm','Data-Structure','Maths']}
                                value={formData.questions_tags}
                            />
                        </FormSectionRow>
                    </FormSection>
                    <FormSection title="Additional">
                        <FormSectionRow>
                            <FormInputField 
                                label="Host Name"
                                placeholder="eg. Google"
                                onChange={(value) => setFormData({ 
                                    ...formData, 
                                    host: { 
                                        ...formData.host, 
                                        name: value 
                                    } 
                                })}
                                type="text"
                                value={formData.host.name}
                            />
                            <FormInputField 
                                label="Host Logo"
                                placeholder="eg. https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-1024.png"
                                onChange={(value) => setFormData({ 
                                    ...formData, 
                                    host: { 
                                        ...formData.host, 
                                        meta: { 
                                        ...formData.host.meta, 
                                        logo: value 
                                        } 
                                    } 
                                })}
                                type="text"
                                value={formData.host.meta.logo}
                            />
                            <FormInputField 
                                label="Host Website"
                                placeholder="eg. https://www.google.com"
                                onChange={(value) => setFormData({ 
                                    ...formData, 
                                    host: { 
                                        ...formData.host, 
                                        meta: { 
                                        ...formData.host.meta, 
                                        website: value 
                                        } 
                                    } 
                                })}
                                type="text"
                                value={formData.host.meta.website}
                            />
                        </FormSectionRow>
                    </FormSection>
                    <FormButtons>
                        <FormButton
                            buttonText="Clear Form"
                            onClick={()=>{
                                setFormData(initialFormData);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            loading={loading}
                        />
                        <FormButton
                            buttonText="Send to Approval"
                            onClick={()=>{}}
                            loading={loading}
                        />
                    </FormButtons>
                </div>
            </div>
        </div>
    )
}

export default CreateContest;