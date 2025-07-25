// src/components/PageWrapper.js
import React from 'react';
import StepProgressBar from './StepProgressBar';
import PageTitle from './PageTitle';

const PageWrapper = ({ currentStep, title, children }) => {
  return (
    <div>
      
      <PageTitle title={title} />
      <StepProgressBar currentStep={currentStep} />
      <div
        style={{
          fontFamily: '"Noto Serif JP", serif',
          backgroundColor: '#fdfaf6',
          padding: '30px 10%',
          border: '12px solid #eae2d0',
          borderRadius: '16px',
          margin: '20px auto',
          maxWidth: '800px',
          boxShadow: '0 0 20px rgba(0,0,0,0.05)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
