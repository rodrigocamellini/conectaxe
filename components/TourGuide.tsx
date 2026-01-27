import React from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface TourGuideProps {
  run: boolean;
  onFinish: () => void;
}

export const TourGuide: React.FC<TourGuideProps> = ({ run, onFinish }) => {
  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      onFinish();
    }
  };

  const TOUR_STEPS: Step[] = [
    {
      target: 'body',
      content: <div className="text-center">
        <h3 className="font-bold text-lg mb-2">Bem-vindo ao Sistema!</h3>
        <p>Vamos fazer um tour rápido pelas principais funcionalidades?</p>
      </div>,
      placement: 'center',
    },
    {
      target: '[data-tour="sidebar"]',
      content: 'Este é o Menu Principal. Aqui você navega entre todos os módulos do sistema, como Cadastros, Financeiro e Estoque.',
      placement: 'right',
    },
    {
      target: '[data-tour="header-user"]',
      content: 'Aqui você gerencia seu perfil, visualiza notificações e faz logout do sistema.',
      placement: 'left',
    }
  ];

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      continuous
      showSkipButton
      showProgress
      disableOverlayClose
      spotlightClicks
      styles={{
        options: {
          primaryColor: '#4f46e5',
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        buttonNext: {
          backgroundColor: '#4f46e5'
        },
        buttonBack: {
          color: '#64748b'
        }
      }}
      callback={handleJoyrideCallback}
      locale={{
        back: 'Voltar',
        close: 'Fechar',
        last: 'Finalizar',
        next: 'Próximo',
        skip: 'Pular'
      }}
    />
  );
};
