<template>
  <div>
    <amplify-authenticator v-bind:authConfig="authConfig"></amplify-authenticator>
  </div>
</template>
<script>
export default {
  name: 'Authentication',
  props: [],
  data () {
    return {
      authConfig: {
          signUpConfig: {
            header: 'My Customized Sign Up',
            hideAllDefaults: true,
            defaultCountryCode: '1',
            signUpFields: [
              {
                label: 'Email',
                key: 'email',
                required: true,
                displayOrder: 1,
                type: 'string',
                signUpWith: true
              },
              {
                label: 'Password',
                key: 'password',
                required: true,
                displayOrder: 2,
                type: 'password'
              },
              {
                label: 'PhoneNumber',
                key: 'phone_number',
                required: true,
                displayOrder: 3,
                type: 'string'
              },
              {
                label: 'Custom Attribute',
                key: 'custom_attr',
                required: false,
                displayOrder: 4,
                type: 'string',
                custom: true
              }
            ]
          }
        }
      }
    }
  }
</script>