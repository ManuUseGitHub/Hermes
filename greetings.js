const getHelloLocalizedDescription = ( role ) => {
    const lang = /^M-([a-z]{0,3})$/.exec( role );

    if ( !lang ) {
        return "NOT TRANSLATABLE";
    }

    let result;
    switch ( lang[ 1 ] ) {
        case "fr" :
            result = `Bonjour ! C'est un plaisir de vous compter parmi nous. Voulant assurer la bonne entente sur notre serveur, nous désirons analyser tout nouvel arrivant pour nous assurer que l'apprentissage de chacun se fasse dans les meilleures conditions.

Nous vous avons mis en état d'attente. Vous allez être contacté par un membre de notre équipe dans votre langue ou en anglais afin de vérifier vos raisons de nous rejoindre.
            
Vous recevrez un message quand cela sera fait et à vous la joie de l'apprentissage ! :) !
            
A bientôt!`;
            break;

        case "jp" :
            result = `こんにちは ！ どうぞよろしくお願いいたします。 サーバー上で良好な関係を確保したいので、新規参入者を分析して、すべての人の学習が最良の条件で行われるようにします。

保留にします。 私たちのチームのメンバーから、あなたの言語または英語で、私たちに参加する理由を確認するための連絡があります。
            
それが完了するとあなたはメッセージを受け取ります、そして学ぶことの喜びはあなたのものです！ :)！
            
また近いうちにお会いしましょう！`;
            break;

            case "id" :
                result = `Halo ! Ini adalah kesenangan untuk memiliki Anda dengan kami. Ingin memastikan hubungan baik di server kami, kami ingin menganalisis setiap pendatang baru untuk memastikan bahwa pembelajaran setiap orang berlangsung dalam kondisi terbaik.

Kami menahan Anda. Anda akan dihubungi oleh anggota tim kami untuk memverifikasi alasan Anda bergabung dengan kami.

Anda akan menerima pesan setelah selesai dan kegembiraan belajar adalah milik Anda! :)!
            
Sampai berjumpa lagi!`;
                break;
        default :
            result = `Hello ! It is a pleasure to have you with us. Wanting to ensure good relations on our server, we want to analyze any newcomer to ensure that everyone's learning takes place in the best conditions.

We put you on hold. You will be contacted by a member of our team to verify your reasons for joining us.
            
You will receive a message when it is done and the joy of learning is yours! :)!
            
See you soon!`;
            break;
    }
    return result;
};

const getHelloLocalizedAcceptation = ( role ) => {
    const lang = /^M-([a-z]{0,3})$/.exec( role );

    if ( !lang ) {
        return "NOT TRANSLATABLE";
    }

    let result;
    switch ( lang[ 1 ] ) {
        case "fr" :
            result = `Hourra ! Votre adhésion sur **ziQuatorze** a été validée par un modérateur. Vous pouvez maintenant profiter plainement du server.

Premièrement, rendez vous dans le channel <#837165560873484359> et choisissez:
- 1: l'îcone qui correspond à votre langue maternelle
- 2: les autres îcones des langues qui vous intéressents
- 3: les thématiques du propriétaire du server (optionel)`;
            break;

        case "jp" :
            result = `やったー！ **ziQuatorze**のメンバーシップは、モデレーターによって検証されています。 これで、サーバーを十分に楽しむことができます。

まず、チャンネル <#837165777219223572> にアクセスして、次を選択します。
-1：あなたの母国語に対応するアイコン
-2：興味のある言語の他のアイコン
-3：サーバー所有者のテーマ（オプション）`;
            break;

        case "id" :
            result = `Hore! Keanggotaan Anda di **ziQuatorze** telah divalidasi oleh moderator. Anda sekarang dapat menikmati server sepenuhnya.

Pertama, buka saluran <#874032476077584404> dan pilih:
- 1: ikon yang sesuai dengan bahasa ibu Anda
- 2: ikon lain dari bahasa yang Anda minati
- 3: tema pemilik server (opsional)`;    
        break;

        default :
            result = `Hooray! Your membership on **ziQuatorze** has been validated by a moderator. You can now fully enjoy the server.

First, go to the channel <#831183859588268052> and choose:
- 1: the icon that corresponds to your mother tongue
- 2: the other icons of the languages that interest you
- 3: the themes of the server owner (optional)`;
            break;
    }
    return result;
};

module.exports = { getHelloLocalizedDescription , getHelloLocalizedAcceptation };