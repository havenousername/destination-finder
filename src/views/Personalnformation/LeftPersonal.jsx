import {Row} from "react-bootstrap";
import styles from "./PersonalInformation.module.css";
import AvatarIcon from "./AvatarIcon";
import {capitalize} from "lodash";
import VisitedHistory from "./VisitedHistory";
import UploadImage from "../../components/UploadImage";
import useUpdateUser from "../../api/user/useUpdateUser";
import TextWithInput from "../../components/TextWithInput";
import { message } from "antd";
const LeftPersonal = ({ personalInfo, onLoadPersonal }) => {
  const { uploadImageToField, update } = useUpdateUser();
  if (!personalInfo) {
    return null;
  }
  const initials = personalInfo.username.slice(0, 2).toUpperCase();
  return (
    <div className='p-3'>
      <Row className='position-relative mb-4'>
        <UploadImage
          image={personalInfo.coverPhoto}
          onSave={(file) => {   
            try{
             uploadImageToField(file, personalInfo).then(() => {
               onLoadPersonal();
               message.success("Image successfully uploaded")
             })
            }
            catch(e){
              message.error(e.message || "Image failed to upload");
            }
          }}
        />
        <div
          className={styles.avatarWrapper}
        >
          <AvatarIcon
            size={56}
            image={personalInfo.profilePhoto}
            label={initials}
            onSave={(file) => {   
              try{
                uploadImageToField(file, personalInfo, 'profilePhoto').then(() => {
                  onLoadPersonal();
                  message.success("Profile picture successfully uploaded")
                })
              }
              catch(e){
                message.error(e.message || "Profile picture failed to upload");
              }
            }}
          />
        </div>
      </Row>
      <Row className='pt-2'>
        <h4 className='fs-6 fw-bold'>{capitalize(personalInfo.username)}</h4>
        <Row className='align-items-end'>
          <h6 className={`${styles.fs7} fw-normal col-3`}>Occupation</h6>
          <div className='col-9'>
            <TextWithInput
              createNewGroup={false}
              text={personalInfo.occupation}
              defaultText={'No occupation'}
              iconClassName={styles.actionStates}
              onSave={(occupation) => {
                try {
                  update({occupation})
                    .then(() => {
                      message.success(`Occupation successfully updated"`);
                    })
                } catch (e) {
                  message.error(e.message || "Failed to update users occupation");
                }
              }}
            />
          </div>
        </Row>
      </Row>
      <Row className='pt-2'>
        <h4 className='fs-6 fw-bold fw-normal'>Personal Information</h4>
        <Row>
          <h6 className={`${styles.fs7} col-3 fw-normal`}>Email</h6>
          <h6 className={`${styles.fs7} col-5 fw-bold`}>{personalInfo.email}</h6>
        </Row>
        <Row>
          <h6 className={`${styles.fs7} col-3 fw-normal`}>Joined At</h6>
          <h6 className={`${styles.fs7} col-5 fw-bold`}>{new Date(personalInfo.createdAt).toLocaleDateString()}</h6>
        </Row>
      </Row>
      <div className='mt-4'>
        <VisitedHistory userId={personalInfo.id} />
      </div>
    </div>
  );
};

export default LeftPersonal;